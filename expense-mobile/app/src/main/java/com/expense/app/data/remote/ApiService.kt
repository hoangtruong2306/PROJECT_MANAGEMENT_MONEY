package com.expense.app.data.remote

import com.expense.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Auth ──────────────────────────────────────
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @GET("api/auth/me")
    suspend fun getMe(@Header("Authorization") token: String): Response<MeResponse>

    // ── Transactions ─────────────────────────────
    // Returns direct array
    @GET("api/transactions/user/{userId}")
    suspend fun getTransactions(@Path("userId") userId: String): Response<List<Transaction>>

    // Returns {message, data: [...]} — wrapped
    @GET("api/transactions/recent/{userId}")
    suspend fun getRecentTransactions(@Path("userId") userId: String): Response<ApiResponse<List<Transaction>>>

    @POST("api/transactions")
    suspend fun createTransaction(@Body body: CreateTransactionRequest): Response<Transaction>

    @PUT("api/transactions/{id}")
    suspend fun updateTransaction(@Path("id") id: String, @Body body: Transaction): Response<Transaction>

    @DELETE("api/transactions/{id}")
    suspend fun deleteTransaction(@Path("id") id: String): Response<Unit>

    // ── Stats ────────────────────────────────────
    // All stats endpoints return {message, data: ...} — wrapped
    @GET("api/stats/user/{userId}")
    suspend fun getUserStats(@Path("userId") userId: String): Response<ApiResponse<UserStats>>

    @GET("api/stats/category/{userId}")
    suspend fun getCategoryStats(@Path("userId") userId: String): Response<ApiResponse<List<CategoryStat>>>

    @GET("api/stats/trend/{userId}")
    suspend fun getTrendStats(@Path("userId") userId: String): Response<ApiResponse<List<TrendStat>>>

    @GET("api/stats/monthly/{userId}")
    suspend fun getMonthlyStats(@Path("userId") userId: String): Response<ApiResponse<List<MonthlyStat>>>

    // ── Wallets ──────────────────────────────────
    // Returns direct array
    @GET("api/wallets/user/{userId}")
    suspend fun getWallets(@Path("userId") userId: String): Response<List<Wallet>>

    @POST("api/wallets")
    suspend fun createWallet(@Body body: CreateWalletRequest): Response<Wallet>

    @PUT("api/wallets/{id}")
    suspend fun updateWallet(@Path("id") id: String, @Body body: Wallet): Response<Wallet>

    @DELETE("api/wallets/{id}")
    suspend fun deleteWallet(@Path("id") id: String): Response<Unit>

    // ── Goals ────────────────────────────────────
    // Returns direct array
    @GET("api/goals/user/{userId}")
    suspend fun getGoals(@Path("userId") userId: String): Response<List<Goal>>

    @POST("api/goals")
    suspend fun createGoal(@Body body: CreateGoalRequest): Response<Goal>

    @PUT("api/goals/{id}")
    suspend fun updateGoal(@Path("id") id: String, @Body body: Goal): Response<Goal>

    @DELETE("api/goals/{id}")
    suspend fun deleteGoal(@Path("id") id: String): Response<Unit>

    @PATCH("api/goals/{id}/deposit")
    suspend fun depositGoal(@Path("id") id: String, @Body body: DepositRequest): Response<Goal>

    @PUT("api/auth/profile")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): Response<UpdateProfileResponse>

    @PUT("api/auth/change-password")
    suspend fun changePassword(@Body body: ChangePasswordRequest): Response<Unit>

    // ── Categories ───────────────────────────────
    // Returns direct array
    @GET("api/categories")
    suspend fun getCategories(): Response<List<Category>>

    // ── Budgets ──────────────────────────────────
    @GET("api/budgets/user/{userId}")
    suspend fun getBudgets(@Path("userId") userId: String): Response<List<Budget>>

    @POST("api/budgets")
    suspend fun createBudget(@Body body: CreateBudgetRequest): Response<Budget>

    @DELETE("api/budgets/{id}")
    suspend fun deleteBudget(@Path("id") id: String): Response<Unit>

    // ── AI Chat ──────────────────────────────────
    @POST("api/ai/chat")
    suspend fun sendChat(@Body body: ChatRequest): Response<ChatResponse>

    // ── Sync & Health ───────────────────────────
    @GET("api/sync/health")
    suspend fun ping(): Response<Unit>

    @POST("api/sync/batch")
    suspend fun batchSync(@Body body: BatchSyncRequest): Response<BatchSyncResponse>
}
