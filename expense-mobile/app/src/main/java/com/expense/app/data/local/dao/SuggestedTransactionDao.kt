package com.expense.app.data.local.dao

import androidx.room.*
import com.expense.app.data.local.entity.SuggestedTransactionEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO cho bảng suggested_transactions.
 * Quản lý giao dịch tự động nhận diện từ notification ngân hàng.
 */
@Dao
interface SuggestedTransactionDao {

    /**
     * Lấy tất cả giao dịch PENDING chờ user xác nhận.
     * Sắp xếp theo thời gian mới nhất trước.
     */
    @Query("SELECT * FROM suggested_transactions WHERE status = 'PENDING' ORDER BY createdAt DESC")
    suspend fun getPending(): List<SuggestedTransactionEntity>

    /**
     * Flow reactive cho pending count — dùng cho badge trên UI.
     */
    @Query("SELECT COUNT(*) FROM suggested_transactions WHERE status = 'PENDING'")
    fun getPendingCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM suggested_transactions WHERE status = 'PENDING'")
    suspend fun getPendingCount(): Int

    /**
     * Lấy theo status (PENDING, APPROVED, REJECTED).
     */
    @Query("SELECT * FROM suggested_transactions WHERE status = :status ORDER BY createdAt DESC")
    suspend fun getByStatus(status: String): List<SuggestedTransactionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: SuggestedTransactionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<SuggestedTransactionEntity>)

    /**
     * Cập nhật trạng thái (APPROVED / REJECTED).
     */
    @Query("UPDATE suggested_transactions SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: String, status: String)

    /**
     * Xóa suggestions cũ hơn N ngày (dọn dẹp tự động).
     */
    @Query("DELETE FROM suggested_transactions WHERE createdAt < :olderThan")
    suspend fun deleteOlderThan(olderThan: Long)

    /**
     * Xóa tất cả đã REJECTED hoặc APPROVED (cleanup).
     */
    @Query("DELETE FROM suggested_transactions WHERE status != 'PENDING'")
    suspend fun clearProcessed()

    @Query("DELETE FROM suggested_transactions")
    suspend fun clearAll()
}
