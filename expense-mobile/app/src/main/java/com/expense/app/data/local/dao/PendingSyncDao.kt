package com.expense.app.data.local.dao

import androidx.room.*
import com.expense.app.data.local.entity.PendingSyncEntity

/**
 * DAO cho bảng pending_sync.
 * Quản lý các thao tác chờ đồng bộ lên server.
 */
@Dao
interface PendingSyncDao {

    @Query("SELECT * FROM pending_sync WHERE syncStatus = 'PENDING' OR syncStatus = 'FAILED' ORDER BY createdAt ASC")
    suspend fun getPendingItems(): List<PendingSyncEntity>

    @Query("SELECT * FROM pending_sync WHERE syncStatus = 'PENDING' ORDER BY createdAt ASC")
    suspend fun getPendingOnly(): List<PendingSyncEntity>

    @Query("SELECT COUNT(*) FROM pending_sync WHERE syncStatus != 'SYNCED'")
    suspend fun getPendingCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: PendingSyncEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<PendingSyncEntity>)

    @Query("UPDATE pending_sync SET syncStatus = :status WHERE localId = :id")
    suspend fun updateStatus(id: String, status: String)

    @Query("UPDATE pending_sync SET syncStatus = :status, errorMessage = :error, retryCount = retryCount + 1 WHERE localId = :id")
    suspend fun updateStatusWithError(id: String, status: String, error: String)

    @Query("UPDATE pending_sync SET firebaseDocId = :docId WHERE localId = :id")
    suspend fun updateFirebaseDocId(id: String, docId: String)

    @Query("DELETE FROM pending_sync WHERE syncStatus = 'SYNCED'")
    suspend fun clearSynced()

    @Query("DELETE FROM pending_sync WHERE localId = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM pending_sync")
    suspend fun clearAll()

    @Query("SELECT * FROM pending_sync WHERE retryCount >= :maxRetries AND syncStatus = 'FAILED'")
    suspend fun getFailedItems(maxRetries: Int = 5): List<PendingSyncEntity>
}
