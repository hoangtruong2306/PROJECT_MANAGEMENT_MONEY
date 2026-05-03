package com.expense.app.data.model

import com.google.gson.annotations.SerializedName

// ── Auth ──────────────────────────────────────────
data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class AuthResponse(val token: String, val user: User)
data class MeResponse(val user: User)

data class User(
    val id: String,
    val full_name: String,
    val email: String,
    val role: String? = "user",
    val created_at: String? = null
)

// ── API Wrapper Responses ─────────────────────────
// Some backend endpoints wrap data in {message, data} format
data class ApiResponse<T>(
    val message: String? = null,
    val data: T? = null
)

// ── Transaction ───────────────────────────────────
// Maps to MySQL columns: id, user_id, wallet_id, category_id, type, amount, note, transaction_date
data class Transaction(
    val id: String? = null,
    val user_id: String? = null,
    val type: String,            // "income" | "expense"
    val amount: Double,
    val category_id: String? = null,
    val note: String? = null,
    val transaction_date: String? = null,
    val wallet_id: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null
) {
    // Helper: display-friendly category name (resolved externally or fallback)
    val displayCategory: String get() = category_id ?: "Khác"
    val displayDescription: String get() = note ?: ""
}

data class CreateTransactionRequest(
    val user_id: String,
    val type: String,
    val amount: Double,
    val category_id: String,
    val note: String? = null,
    val wallet_id: String? = null,
    val transaction_date: String? = null
)

// ── Stats ─────────────────────────────────────────
data class UserStats(
    val total_income: Double = 0.0,
    val total_expense: Double = 0.0,
    val balance: Double = 0.0,
    val transaction_count: Int = 0,
    val expense_this_month: Double = 0.0,
    val expense_last_month: Double = 0.0,
    val top_category: String? = null,
    val top_category_amount: Double = 0.0
)

data class CategoryStat(
    val category_id: String? = null,
    val category_name: String? = null,
    val total: Double = 0.0
)

data class TrendStat(
    val month: String,
    val current: Double = 0.0,
    val previous: Double = 0.0
)

data class MonthlyStat(
    val month: String,
    val income: Double = 0.0,
    val expense: Double = 0.0
)

// ── Wallet ────────────────────────────────────────
data class Wallet(
    val id: String? = null,
    val user_id: String? = null,
    val name: String,
    val balance: Double = 0.0,
    val type: String? = "cash",
    val created_at: String? = null
)

data class CreateWalletRequest(
    val user_id: String,
    val name: String,
    val balance: Double = 0.0,
    val type: String = "cash"
)

// ── Goal ──────────────────────────────────────────
data class Goal(
    val id: String? = null,
    val user_id: String? = null,
    val name: String,
    val target_amount: Double = 0.0,
    val current_amount: Double = 0.0,
    val deadline: String? = null,
    val created_at: String? = null
)

data class CreateGoalRequest(
    val user_id: String,
    val name: String,
    val target_amount: Double,
    val deadline: String? = null
)

data class DepositRequest(val amount: Double)

// ── Category ──────────────────────────────────────
data class Category(
    val id: String? = null,
    val name: String,
    val icon: String? = null,
    val type: String? = null
)

// ── Budget ────────────────────────────────────────
data class Budget(
    val id: String? = null,
    val user_id: String? = null,
    val category_id: String? = null,
    val category_name: String? = null,
    val amount: Double = 0.0,
    val period: String = "monthly",
    val created_at: String? = null
)

data class CreateBudgetRequest(
    val user_id: String,
    val category_id: String,
    val amount: Double,
    val period: String = "monthly"
)

// ── Profile update ────────────────────────────────
data class UpdateProfileRequest(val name: String, val email: String)
data class UpdateProfileResponse(val user: User)
data class ChangePasswordRequest(val currentPassword: String, val newPassword: String)

// ── AI Chat ───────────────────────────────────────
data class ChatRequest(val message: String)
data class ChatResponse(val reply: String)

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestampMs: Long = System.currentTimeMillis()
) {
    // Formatted "HH:mm" for display
    val timestamp: String
        get() {
            val cal = java.util.Calendar.getInstance().apply { timeInMillis = timestampMs }
            return "%02d:%02d".format(
                cal.get(java.util.Calendar.HOUR_OF_DAY),
                cal.get(java.util.Calendar.MINUTE)
            )
        }
}

// ── Batch Sync ───────────────────────────────────
/**
 * Request body cho POST /api/sync/batch.
 * Gom tất cả pending operations thành 1 batch gửi lên server.
 */
data class BatchSyncRequest(
    val items: List<BatchSyncItem>
)

data class BatchSyncItem(
    val localId: String,
    val action: String,        // "CREATE" | "UPDATE" | "DELETE" | "DEPOSIT"
    val entityType: String,    // "transaction" | "wallet" | "goal" | "budget"
    val payload: String,       // JSON string
    val userId: String,
    val createdAt: Long
)

/**
 * Response từ POST /api/sync/batch.
 * Server trả về kết quả sync cho từng item.
 */
data class BatchSyncResponse(
    val message: String? = null,
    val results: List<BatchSyncResult> = emptyList(),
    val summary: BatchSyncSummary? = null
)

data class BatchSyncResult(
    val localId: String,
    val status: String,        // "SYNCED" | "FAILED"
    val serverId: String? = null,
    val error: String? = null
)

data class BatchSyncSummary(
    val total: Int = 0,
    val success: Int = 0,
    val failed: Int = 0
)

