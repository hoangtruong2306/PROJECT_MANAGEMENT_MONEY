package com.expense.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * Entity lưu giao dịch được nhận diện tự động từ notification ngân hàng.
 * Ở trạng thái PENDING cho đến khi user xác nhận (APPROVED) hoặc bỏ qua (REJECTED).
 */
@Entity(tableName = "suggested_transactions")
data class SuggestedTransactionEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),

    val amount: Double,

    val type: String,                   // "income" | "expense"

    val bankName: String,               // "Vietcombank" | "MoMo" | "BIDV" ...

    val description: String,            // Mô tả trích xuất từ notification

    val suggestedCategoryId: String? = null,  // Category ID gợi ý (AI hoặc keyword match)

    val suggestedCategoryName: String? = null, // Tên category gợi ý để hiển thị UI

    val confidence: Float = 0f,         // Độ tin cậy phân loại (0.0 - 1.0)

    val rawNotificationText: String,    // Nội dung gốc notification để debug

    val packageName: String,            // Package app ngân hàng

    val status: String = "PENDING",     // "PENDING" | "APPROVED" | "REJECTED"

    val balanceAfter: Double? = null,   // Số dư sau giao dịch (nếu extract được)

    val createdAt: Long = System.currentTimeMillis()
)
