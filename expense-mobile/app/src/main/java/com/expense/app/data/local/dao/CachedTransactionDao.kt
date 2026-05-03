package com.expense.app.data.local.dao

import androidx.room.*
import com.expense.app.data.local.entity.CachedTransactionEntity

/**
 * DAO cho bảng cached_transactions.
 * Cache giao dịch để hiển thị UI nhanh và hỗ trợ offline.
 */
@Dao
interface CachedTransactionDao {

    @Query("SELECT * FROM cached_transactions WHERE userId = :userId ORDER BY transactionDate DESC")
    suspend fun getByUser(userId: String): List<CachedTransactionEntity>

    @Query("SELECT * FROM cached_transactions WHERE userId = :userId ORDER BY transactionDate DESC LIMIT 5")
    suspend fun getRecent(userId: String): List<CachedTransactionEntity>

    @Query("SELECT * FROM cached_transactions WHERE isPending = 1 AND userId = :userId")
    suspend fun getPending(userId: String): List<CachedTransactionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: CachedTransactionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<CachedTransactionEntity>)

    @Query("UPDATE cached_transactions SET isPending = 0, localSyncId = NULL WHERE localSyncId = :syncId")
    suspend fun markSynced(syncId: String)

    /**
     * Đánh dấu đã sync và cập nhật ID từ local sang server ID.
     * Dùng sau khi batch sync trả về serverId.
     */
    @Query("UPDATE cached_transactions SET isPending = 0, id = :serverId, localSyncId = NULL WHERE localSyncId = :localId")
    suspend fun markSyncedWithServerId(localId: String, serverId: String)

    @Query("DELETE FROM cached_transactions WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM cached_transactions WHERE userId = :userId")
    suspend fun clearByUser(userId: String)

    @Query("DELETE FROM cached_transactions")
    suspend fun clearAll()
}
