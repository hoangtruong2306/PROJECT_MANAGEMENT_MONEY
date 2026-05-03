package com.expense.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity cache giao dịch offline để hiển thị UI ngay lập tức.
 * Bao gồm cả dữ liệu đã sync (từ server) và chưa sync (pending).
 */
@Entity(tableName = "cached_transactions")
data class CachedTransactionEntity(
    @PrimaryKey
    val id: String,                        // Server ID hoặc local UUID

    val userId: String,

    val type: String,                      // "income" | "expense"

    val amount: Double,

    val categoryId: String? = null,

    val note: String? = null,

    val transactionDate: String? = null,

    val walletId: String? = null,

    val createdAt: String? = null,

    val updatedAt: String? = null,

    val isPending: Boolean = false,        // true = chưa sync lên server

    val localSyncId: String? = null        // Link tới PendingSyncEntity.localId
)
