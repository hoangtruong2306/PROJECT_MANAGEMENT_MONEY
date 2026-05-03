package com.expense.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity lưu các thao tác chờ đồng bộ lên server.
 * Khi server offline → dữ liệu được lưu vào Room + Firestore.
 * Khi server online → SyncWorker đọc pending items và gửi batch lên server.
 */
@Entity(tableName = "pending_sync")
data class PendingSyncEntity(
    @PrimaryKey
    val localId: String,                   // UUID local

    val action: String,                    // "CREATE" | "UPDATE" | "DELETE"

    val entityType: String,                // "transaction" | "wallet" | "goal" | "budget"

    val payload: String,                   // JSON data (serialized request body)

    val userId: String,

    val createdAt: Long = System.currentTimeMillis(),

    val syncStatus: String = "PENDING",    // "PENDING" | "SYNCING" | "SYNCED" | "FAILED"

    val retryCount: Int = 0,

    val firebaseDocId: String? = null,     // Firestore document ID sau khi upload

    val errorMessage: String? = null,      // Lỗi gần nhất nếu sync thất bại

    val updatedAt: Long = System.currentTimeMillis()  // Timestamp cho conflict resolution (Last Write Wins)
)
