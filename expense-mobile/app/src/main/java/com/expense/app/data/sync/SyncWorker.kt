package com.expense.app.data.sync

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.expense.app.data.cloud.FirestoreSync
import com.expense.app.data.local.AppDatabase
import com.expense.app.data.local.entity.PendingSyncEntity
import com.expense.app.data.model.BatchSyncItem
import com.expense.app.data.model.BatchSyncRequest
import com.expense.app.data.remote.RetrofitClient
import com.expense.app.data.remote.TokenManager

/**
 * WorkManager Worker chạy nền để đồng bộ dữ liệu từ Firestore/Room → Backend MySQL.
 *
 * Flow (Batch):
 * 1. Kiểm tra server có online không (ping /api/sync/health)
 * 2. Lấy pending items từ Room DB
 * 3. Gom thành BatchSyncRequest → gửi 1 lần lên POST /api/sync/batch
 * 4. Parse response → cập nhật trạng thái từng item trên Room + Firestore
 * 5. Cập nhật CachedTransactions: thay local ID bằng server ID
 */
class SyncWorker(
    private val ctx: Context,
    params: WorkerParameters
) : CoroutineWorker(ctx, params) {

    companion object {
        const val TAG = "SyncWorker"
        const val MAX_RETRIES = 5
        const val BATCH_SIZE = 50  // Giới hạn số items mỗi batch
    }

    private val db = AppDatabase.getInstance(ctx)
    private val pendingSyncDao = db.pendingSyncDao()
    private val cachedTxDao = db.cachedTransactionDao()
    private val firestoreSync = FirestoreSync.getInstance()
    private val api = RetrofitClient.create(ctx)

    override suspend fun doWork(): Result {
        Log.d(TAG, "SyncWorker started")

        // 1. Kiểm tra server có online không
        val networkMonitor = NetworkMonitor.getInstance(ctx)
        val serverOnline = networkMonitor.checkServerNow()

        if (!serverOnline) {
            Log.d(TAG, "Server offline — retry later")
            return Result.retry()
        }

        // 2. Lấy pending items từ Room
        var pendingItems = pendingSyncDao.getPendingItems()

        if (pendingItems.isEmpty()) {
            Log.d(TAG, "No pending items in Room")
            // Cũng kiểm tra Firestore có pending items không
            val userId = TokenManager.getUserIdSync(ctx)
            if (userId != null) {
                val firestoreItems = firestoreSync.getPendingItems(userId)
                if (firestoreItems.isEmpty()) {
                    Log.d(TAG, "Firestore also clean — nothing to sync")
                    return Result.success()
                }
                // Có items trên Firestore → thêm vào Room rồi sync
                firestoreItems.forEach { pendingSyncDao.insert(it) }
                pendingItems = firestoreItems
            } else {
                return Result.success()
            }
        }

        return doBatchSync(pendingItems)
    }

    /**
     * Gom tất cả pending items → gửi batch lên server → xử lý kết quả.
     */
    private suspend fun doBatchSync(items: List<PendingSyncEntity>): Result {
        // Lọc bỏ items đã vượt max retries
        val syncableItems = items.filter { it.retryCount < MAX_RETRIES }
        val skippedCount = items.size - syncableItems.size

        if (skippedCount > 0) {
            Log.w(TAG, "Skipped $skippedCount items — max retries reached")
        }

        if (syncableItems.isEmpty()) {
            Log.d(TAG, "No syncable items after filtering")
            return Result.success()
        }

        // Chia thành batches nếu quá nhiều items
        val batches = syncableItems.chunked(BATCH_SIZE)
        var totalSuccess = 0
        var totalFail = 0

        for ((batchIndex, batch) in batches.withIndex()) {
            Log.d(TAG, "Processing batch ${batchIndex + 1}/${batches.size} (${batch.size} items)")

            // Đánh dấu tất cả items trong batch đang sync
            batch.forEach { item ->
                pendingSyncDao.updateStatus(item.localId, "SYNCING")
            }

            try {
                // Chuyển PendingSyncEntity → BatchSyncItem
                val batchRequest = BatchSyncRequest(
                    items = batch.map { entity ->
                        BatchSyncItem(
                            localId = entity.localId,
                            action = entity.action,
                            entityType = entity.entityType,
                            payload = entity.payload,
                            userId = entity.userId,
                            createdAt = entity.createdAt
                        )
                    }
                )

                // Gửi batch lên server
                val response = api.batchSync(batchRequest)

                if (response.isSuccessful && response.body() != null) {
                    val batchResponse = response.body()!!
                    Log.d(TAG, "Batch response: ${batchResponse.message}")

                    // Xử lý từng result
                    for (result in batchResponse.results) {
                        val item = batch.find { it.localId == result.localId }

                        when (result.status) {
                            "SYNCED" -> {
                                // ✅ Sync thành công
                                pendingSyncDao.updateStatus(result.localId, "SYNCED")

                                // Cập nhật Firestore
                                val docId = item?.firebaseDocId ?: result.localId
                                firestoreSync.markSynced(docId)

                                // Cập nhật CachedTransaction: thay localId bằng serverId
                                if (item?.entityType == "transaction" && item.action == "CREATE") {
                                    val serverId = result.serverId
                                    if (serverId != null) {
                                        cachedTxDao.markSyncedWithServerId(result.localId, serverId)
                                        Log.d(TAG, "Updated cached tx: ${result.localId} → $serverId")
                                    } else {
                                        cachedTxDao.markSynced(result.localId)
                                    }
                                }

                                totalSuccess++
                                Log.d(TAG, "✅ Synced: ${result.localId} → serverId=${result.serverId}")
                            }
                            "FAILED" -> {
                                // ❌ Sync thất bại
                                pendingSyncDao.updateStatusWithError(
                                    result.localId,
                                    "FAILED",
                                    result.error ?: "Server returned FAILED"
                                )

                                // Cập nhật Firestore
                                val docId = item?.firebaseDocId ?: result.localId
                                firestoreSync.markFailed(docId, result.error ?: "Unknown error")

                                totalFail++
                                Log.w(TAG, "❌ Failed: ${result.localId} — ${result.error}")
                            }
                            else -> {
                                Log.w(TAG, "⚠️ Unknown status for ${result.localId}: ${result.status}")
                            }
                        }
                    }
                } else {
                    // Server trả lỗi HTTP → đánh dấu tất cả items trong batch là FAILED
                    val errorMsg = "HTTP ${response.code()}: ${response.errorBody()?.string() ?: "Unknown"}"
                    Log.e(TAG, "Batch request failed: $errorMsg")

                    batch.forEach { item ->
                        pendingSyncDao.updateStatusWithError(item.localId, "FAILED", errorMsg)
                        item.firebaseDocId?.let { docId ->
                            firestoreSync.markFailed(docId, errorMsg)
                        }
                    }
                    totalFail += batch.size
                }

            } catch (e: Exception) {
                // Lỗi kết nối → đánh dấu tất cả items trong batch → retry
                Log.e(TAG, "Batch sync exception", e)

                batch.forEach { item ->
                    pendingSyncDao.updateStatusWithError(
                        item.localId,
                        "FAILED",
                        e.message ?: "Connection error"
                    )
                    item.firebaseDocId?.let { docId ->
                        firestoreSync.markFailed(docId, e.message ?: "Connection error")
                    }
                }
                totalFail += batch.size
            }
        }

        // Cleanup items đã sync thành công
        pendingSyncDao.clearSynced()

        // Cleanup Firestore synced documents
        val userId = TokenManager.getUserIdSync(ctx)
        if (userId != null) {
            try {
                firestoreSync.cleanupSynced(userId)
            } catch (e: Exception) {
                Log.w(TAG, "Firestore cleanup failed", e)
            }
        }

        Log.d(TAG, "Sync complete: $totalSuccess success, $totalFail failed, $skippedCount skipped")

        return if (totalFail > 0) Result.retry() else Result.success()
    }
}
