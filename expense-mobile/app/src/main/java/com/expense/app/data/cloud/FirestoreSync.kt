package com.expense.app.data.cloud

import android.util.Log
import com.expense.app.data.local.entity.PendingSyncEntity
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.tasks.await

/**
 * Service quản lý việc đọc/ghi dữ liệu từ Firebase Firestore.
 * Firestore đóng vai trò cloud buffer khi server MySQL không khả dụng.
 *
 * Flow: Mobile → Firestore (cloud buffer) → SyncWorker → Backend → MySQL
 */
class FirestoreSync {

    private val db = Firebase.firestore
    private val collectionName = "pending_sync"

    companion object {
        private const val TAG = "FirestoreSync"

        @Volatile
        private var INSTANCE: FirestoreSync? = null

        fun getInstance(): FirestoreSync {
            return INSTANCE ?: synchronized(this) {
                val instance = FirestoreSync()
                INSTANCE = instance
                instance
            }
        }
    }

    /**
     * Đẩy pending operation lên Firestore cloud.
     * @return Firestore document ID
     */
    suspend fun pushToCloud(entity: PendingSyncEntity): String {
        return try {
            val data = hashMapOf(
                "localId" to entity.localId,
                "action" to entity.action,
                "entityType" to entity.entityType,
                "payload" to entity.payload,
                "userId" to entity.userId,
                "createdAt" to entity.createdAt,
                "syncStatus" to "PENDING_SERVER",
                "retryCount" to entity.retryCount,
                "uploadedAt" to System.currentTimeMillis()
            )

            val docRef = db.collection(collectionName)
                .document(entity.localId)

            docRef.set(data).await()

            Log.d(TAG, "Pushed to Firestore: ${entity.localId} (${entity.entityType}/${entity.action})")
            docRef.id
        } catch (e: Exception) {
            Log.e(TAG, "Failed to push to Firestore: ${entity.localId}", e)
            throw e
        }
    }

    /**
     * Lấy tất cả pending items của một user từ Firestore.
     */
    suspend fun getPendingItems(userId: String): List<PendingSyncEntity> {
        return try {
            val snapshot = db.collection(collectionName)
                .whereEqualTo("userId", userId)
                .whereEqualTo("syncStatus", "PENDING_SERVER")
                .get()
                .await()

            snapshot.documents.map { doc ->
                PendingSyncEntity(
                    localId = doc.getString("localId") ?: doc.id,
                    action = doc.getString("action") ?: "CREATE",
                    entityType = doc.getString("entityType") ?: "",
                    payload = doc.getString("payload") ?: "{}",
                    userId = doc.getString("userId") ?: userId,
                    createdAt = doc.getLong("createdAt") ?: 0L,
                    syncStatus = "PENDING",
                    retryCount = (doc.getLong("retryCount") ?: 0L).toInt(),
                    firebaseDocId = doc.id
                )
            }.also {
                Log.d(TAG, "Fetched ${it.size} pending items for user $userId")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get pending items from Firestore", e)
            emptyList()
        }
    }

    /**
     * Đánh dấu document đã sync thành công trên Firestore.
     */
    suspend fun markSynced(docId: String) {
        try {
            db.collection(collectionName)
                .document(docId)
                .update(
                    mapOf(
                        "syncStatus" to "SYNCED",
                        "syncedAt" to System.currentTimeMillis()
                    )
                )
                .await()
            Log.d(TAG, "Marked synced on Firestore: $docId")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to mark synced on Firestore: $docId", e)
        }
    }

    /**
     * Đánh dấu document sync thất bại.
     */
    suspend fun markFailed(docId: String, error: String) {
        try {
            db.collection(collectionName)
                .document(docId)
                .update(
                    mapOf(
                        "syncStatus" to "FAILED",
                        "errorMessage" to error,
                        "failedAt" to System.currentTimeMillis()
                    )
                )
                .await()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to mark failed on Firestore: $docId", e)
        }
    }

    /**
     * Xóa tất cả documents đã sync thành công (cleanup).
     * Chạy định kỳ để giảm storage usage trên Firestore.
     */
    suspend fun cleanupSynced(userId: String) {
        try {
            val snapshot = db.collection(collectionName)
                .whereEqualTo("userId", userId)
                .whereEqualTo("syncStatus", "SYNCED")
                .get()
                .await()

            val batch = db.batch()
            snapshot.documents.forEach { doc ->
                batch.delete(doc.reference)
            }
            batch.commit().await()

            Log.d(TAG, "Cleaned up ${snapshot.size()} synced documents")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cleanup synced documents", e)
        }
    }
}
