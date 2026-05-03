package com.expense.app.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.expense.app.data.cloud.FirestoreSync
import com.expense.app.data.local.AppDatabase
import com.expense.app.data.local.entity.CachedTransactionEntity
import com.expense.app.data.local.entity.PendingSyncEntity
import com.expense.app.data.local.entity.SuggestedTransactionEntity
import com.expense.app.data.model.*
import com.expense.app.data.remote.RetrofitClient
import com.expense.app.data.remote.TokenManager
import com.expense.app.data.sync.NetworkMonitor
import com.expense.app.data.sync.SyncScheduler
import com.google.gson.Gson
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

// ── Sync Status ────────────────────────────────
enum class SyncStatus { IDLE, SYNCING, ERROR, OFFLINE }

data class DashboardUiState(
    val isLoading: Boolean = false,
    val stats: UserStats? = null,
    val recentTransactions: List<Transaction> = emptyList(),
    val categoryStats: List<CategoryStat> = emptyList(),
    val trendStats: List<TrendStat> = emptyList(),
    val monthlyStats: List<MonthlyStat> = emptyList(),
    val wallets: List<Wallet> = emptyList(),
    val goals: List<Goal> = emptyList(),
    val budgets: List<Budget> = emptyList(),
    val categories: List<Category> = emptyList(),
    val allTransactions: List<Transaction> = emptyList(),
    val error: String? = null,
    // ── Offline Sync Fields ────────────────────
    val isOffline: Boolean = false,
    val pendingCount: Int = 0,
    val syncStatus: SyncStatus = SyncStatus.IDLE,
    // ── Suggested Transactions ───────────────
    val suggestedTransactions: List<SuggestedTransactionEntity> = emptyList(),
    val suggestedCount: Int = 0
)

class DashboardViewModel(app: Application) : AndroidViewModel(app) {
    private val api = RetrofitClient.create(app)
    private val ctx = app.applicationContext

    // ── Offline Sync Dependencies ──────────────
    private val localDb = AppDatabase.getInstance(app)
    private val pendingSyncDao = localDb.pendingSyncDao()
    private val cachedTxDao = localDb.cachedTransactionDao()
    private val suggestedTxDao = localDb.suggestedTransactionDao()
    private val firestoreSync = FirestoreSync.getInstance()
    private val networkMonitor = NetworkMonitor.getInstance(app)
    private val gson = Gson()

    private val _state = MutableStateFlow(DashboardUiState())
    val state: StateFlow<DashboardUiState> = _state.asStateFlow()

    init {
        // Theo dõi trạng thái server
        viewModelScope.launch {
            networkMonitor.isServerReachable.collect { reachable ->
                _state.value = _state.value.copy(
                    isOffline = !reachable,
                    syncStatus = if (reachable) SyncStatus.IDLE else SyncStatus.OFFLINE
                )
                // Nếu server vừa online → refresh data
                if (reachable) {
                    refreshPendingCount()
                    loadDashboard()
                }
            }
        }

        // Theo dõi pending count
        viewModelScope.launch {
            refreshPendingCount()
        }

        // Schedule periodic sync
        SyncScheduler.schedulePeriodic(app)

        // Theo dõi suggested transactions (đếm badge)
        viewModelScope.launch {
            suggestedTxDao.getPendingCountFlow().collect { count ->
                _state.value = _state.value.copy(suggestedCount = count)
            }
        }
    }

    private suspend fun refreshPendingCount() {
        try {
            val count = pendingSyncDao.getPendingCount()
            _state.value = _state.value.copy(pendingCount = count)
        } catch (e: Exception) {
            Log.e("DashVM", "refreshPendingCount error", e)
        }
    }

    fun loadDashboard() {
        val userId = TokenManager.getUserIdSync(ctx)
        if (userId == null) {
            Log.e("DashVM", "loadDashboard: userId is null! Cannot fetch data.")
            return
        }
        Log.d("DashVM", "loadDashboard: userId=$userId")

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                // Load all data in parallel
                val statsDeferred = async { api.getUserStats(userId) }
                val recentDeferred = async { api.getRecentTransactions(userId) }
                val catStatsDeferred = async { api.getCategoryStats(userId) }
                val trendDeferred = async { api.getTrendStats(userId) }
                val monthlyDeferred = async { api.getMonthlyStats(userId) }
                val walletsDeferred = async { api.getWallets(userId) }
                val goalsDeferred = async { api.getGoals(userId) }
                val budgetsDeferred = async { api.getBudgets(userId) }
                val categoriesDeferred = async { api.getCategories() }
                val allTxDeferred = async { api.getTransactions(userId) }

                val statsRes = statsDeferred.await()
                val recentRes = recentDeferred.await()
                val catStatsRes = catStatsDeferred.await()
                val trendRes = trendDeferred.await()
                val monthlyRes = monthlyDeferred.await()
                val walletsRes = walletsDeferred.await()
                val goalsRes = goalsDeferred.await()
                val budgetsRes = budgetsDeferred.await()
                val categoriesRes = categoriesDeferred.await()
                val allTxRes = allTxDeferred.await()

                // Unwrap {data} responses from wrapped endpoints
                val stats = statsRes.body()?.data
                val recentTx = recentRes.body()?.data ?: emptyList()
                val catStats = catStatsRes.body()?.data ?: emptyList()
                val trends = trendRes.body()?.data ?: emptyList()
                val monthly = monthlyRes.body()?.data ?: emptyList()

                // Direct response endpoints
                val wallets = walletsRes.body() ?: emptyList()
                val goals = goalsRes.body() ?: emptyList()
                val budgets = budgetsRes.body() ?: emptyList()
                val categories = categoriesRes.body() ?: emptyList()
                val allTx = allTxRes.body() ?: emptyList()

                Log.d("DashVM", "stats: code=${statsRes.code()} data=$stats")
                Log.d("DashVM", "recent: code=${recentRes.code()} count=${recentTx.size}")
                Log.d("DashVM", "catStats: code=${catStatsRes.code()} count=${catStats.size}")
                Log.d("DashVM", "trends: code=${trendRes.code()} count=${trends.size}")
                Log.d("DashVM", "wallets: code=${walletsRes.code()} count=${wallets.size}")
                Log.d("DashVM", "goals: code=${goalsRes.code()} count=${goals.size}")
                Log.d("DashVM", "categories: code=${categoriesRes.code()} count=${categories.size}")
                Log.d("DashVM", "allTx: code=${allTxRes.code()} count=${allTx.size}")

                // Cập nhật pending count
                val pendingCount = pendingSyncDao.getPendingCount()

                _state.value = DashboardUiState(
                    isLoading = false,
                    stats = stats,
                    recentTransactions = recentTx,
                    categoryStats = catStats,
                    trendStats = trends,
                    monthlyStats = monthly,
                    wallets = wallets,
                    goals = goals,
                    budgets = budgets,
                    categories = categories,
                    allTransactions = allTx,
                    isOffline = false,
                    pendingCount = pendingCount,
                    syncStatus = if (pendingCount > 0) SyncStatus.SYNCING else SyncStatus.IDLE
                )

                // Server is reachable
                _state.value = _state.value.copy(isOffline = false)

            } catch (e: Exception) {
                Log.e("DashVM", "loadDashboard error", e)

                // Kiểm tra xem có phải lỗi kết nối không
                val isConnectionError = e is java.net.ConnectException
                        || e is java.net.SocketTimeoutException
                        || e is java.net.UnknownHostException

                val pendingCount = try { pendingSyncDao.getPendingCount() } catch (_: Exception) { 0 }

                _state.value = _state.value.copy(
                    isLoading = false,
                    error = if (isConnectionError) "Không thể kết nối server" else e.localizedMessage,
                    isOffline = isConnectionError,
                    pendingCount = pendingCount,
                    syncStatus = if (isConnectionError) SyncStatus.OFFLINE else SyncStatus.ERROR
                )
            }
        }
    }

    /**
     * Tạo giao dịch mới — hỗ trợ offline-first.
     * Nếu server online → gửi trực tiếp.
     * Nếu server offline → lưu vào Room + Firestore, schedule sync.
     */
    fun createTransaction(type: String, amount: Double, categoryId: String, note: String?, walletId: String?) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        viewModelScope.launch {
            try {
                val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
                val request = CreateTransactionRequest(userId, type, amount, categoryId, note, walletId, today)

                // Thử gửi trực tiếp lên server
                val res = api.createTransaction(request)
                Log.d("DashVM", "createTransaction: code=${res.code()}")
                loadDashboard() // Refresh

            } catch (e: Exception) {
                Log.w("DashVM", "createTransaction online failed, going offline", e)

                // ── OFFLINE PATH ──────────────────────────
                val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(java.util.Date())
                val request = CreateTransactionRequest(userId, type, amount, categoryId, note, walletId, today)
                val localId = UUID.randomUUID().toString()

                // 1. Lưu vào Room pending sync
                val pendingItem = PendingSyncEntity(
                    localId = localId,
                    action = "CREATE",
                    entityType = "transaction",
                    payload = gson.toJson(request),
                    userId = userId
                )
                pendingSyncDao.insert(pendingItem)

                // 2. Cache transaction cho UI (optimistic update)
                val cachedTx = CachedTransactionEntity(
                    id = localId,
                    userId = userId,
                    type = type,
                    amount = amount,
                    categoryId = categoryId,
                    note = note,
                    transactionDate = today,
                    walletId = walletId,
                    isPending = true,
                    localSyncId = localId
                )
                cachedTxDao.insert(cachedTx)

                // 3. Đẩy lên Firestore cloud backup
                try {
                    val docId = firestoreSync.pushToCloud(pendingItem)
                    pendingSyncDao.updateFirebaseDocId(localId, docId)
                } catch (fireErr: Exception) {
                    Log.w("DashVM", "Firestore push failed (data still in Room)", fireErr)
                }

                // 4. Schedule sync khi server online
                SyncScheduler.scheduleOneTime(ctx)

                // 5. Cập nhật UI
                refreshPendingCount()
                _state.value = _state.value.copy(
                    isOffline = true,
                    syncStatus = SyncStatus.OFFLINE
                )

                Log.d("DashVM", "Transaction saved offline: $localId")
            }
        }
    }

    fun deleteTransaction(id: String) {
        viewModelScope.launch {
            try {
                api.deleteTransaction(id)
                loadDashboard()
            } catch (e: Exception) {
                Log.w("DashVM", "deleteTransaction online failed, going offline", e)
                saveOfflineOperation("DELETE", "transaction", """{"id":"$id"}""")
            }
        }
    }

    fun createWallet(name: String, balance: Double, type: String) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        viewModelScope.launch {
            try {
                api.createWallet(CreateWalletRequest(userId, name, balance, type))
                loadDashboard()
            } catch (e: Exception) {
                Log.w("DashVM", "createWallet online failed, going offline", e)
                val request = CreateWalletRequest(userId, name, balance, type)
                saveOfflineOperation("CREATE", "wallet", gson.toJson(request))
            }
        }
    }

    fun createGoal(name: String, targetAmount: Double, deadline: String?) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        viewModelScope.launch {
            try {
                api.createGoal(CreateGoalRequest(userId, name, targetAmount, deadline))
                loadDashboard()
            } catch (e: Exception) {
                Log.w("DashVM", "createGoal online failed, going offline", e)
                val request = CreateGoalRequest(userId, name, targetAmount, deadline)
                saveOfflineOperation("CREATE", "goal", gson.toJson(request))
            }
        }
    }

    fun depositGoal(goalId: String, amount: Double) {
        viewModelScope.launch {
            try {
                api.depositGoal(goalId, DepositRequest(amount))
                loadDashboard()
            } catch (e: Exception) {
                Log.w("DashVM", "depositGoal online failed, going offline", e)
                saveOfflineOperation("DEPOSIT", "goal", """{"id":"$goalId","amount":$amount}""")
            }
        }
    }

    /**
     * Helper: Lưu thao tác offline vào Room + Firestore.
     */
    private suspend fun saveOfflineOperation(action: String, entityType: String, payload: String) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        val localId = UUID.randomUUID().toString()

        val pendingItem = PendingSyncEntity(
            localId = localId,
            action = action,
            entityType = entityType,
            payload = payload,
            userId = userId
        )

        // Lưu Room
        pendingSyncDao.insert(pendingItem)

        // Lưu Firestore
        try {
            val docId = firestoreSync.pushToCloud(pendingItem)
            pendingSyncDao.updateFirebaseDocId(localId, docId)
        } catch (e: Exception) {
            Log.w("DashVM", "Firestore push failed for $entityType/$action", e)
        }

        // Schedule sync
        SyncScheduler.scheduleOneTime(ctx)

        // Update UI
        refreshPendingCount()
        _state.value = _state.value.copy(
            isOffline = true,
            syncStatus = SyncStatus.OFFLINE
        )
    }

    /**
     * Trigger manual sync (từ UI button).
     */
    fun triggerSync() {
        viewModelScope.launch {
            _state.value = _state.value.copy(syncStatus = SyncStatus.SYNCING)
            SyncScheduler.scheduleOneTime(ctx)
            // Sau 3 giây, refresh pending count
            kotlinx.coroutines.delay(3000)
            refreshPendingCount()
            loadDashboard()
        }
    }

    // ── Suggested Transactions (Banking Notification) ──────────

    /**
     * Load danh sách suggested transactions đang PENDING.
     */
    fun loadSuggestedTransactions() {
        viewModelScope.launch {
            try {
                val suggestions = suggestedTxDao.getPending()
                _state.value = _state.value.copy(
                    suggestedTransactions = suggestions,
                    suggestedCount = suggestions.size
                )
            } catch (e: Exception) {
                Log.e("DashVM", "loadSuggestions error", e)
            }
        }
    }

    /**
     * Chấp nhận suggested transaction → tạo transaction thật.
     */
    fun approveSuggestion(suggestion: SuggestedTransactionEntity) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return

        // Tìm category ID phù hợp từ categories đã load
        val categoryId = suggestion.suggestedCategoryId
            ?: _state.value.categories.firstOrNull()?.id
            ?: "1"

        // Tìm wallet mặc định
        val walletId = _state.value.wallets.firstOrNull()?.id

        // Tạo transaction thông qua logic existing (hỗ trợ offline)
        createTransaction(
            type = suggestion.type,
            amount = suggestion.amount,
            categoryId = categoryId,
            note = "${suggestion.bankName}: ${suggestion.description}",
            walletId = walletId
        )

        // Đánh dấu đã approve
        viewModelScope.launch {
            suggestedTxDao.updateStatus(suggestion.id, "APPROVED")
            loadSuggestedTransactions() // Refresh list
        }
    }

    /**
     * Bỏ qua suggested transaction.
     */
    fun rejectSuggestion(suggestion: SuggestedTransactionEntity) {
        viewModelScope.launch {
            suggestedTxDao.updateStatus(suggestion.id, "REJECTED")
            loadSuggestedTransactions() // Refresh list
        }
    }

    /**
     * Cleanup: xóa suggestions cũ hơn 7 ngày.
     */
    fun cleanupOldSuggestions() {
        viewModelScope.launch {
            val sevenDaysAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000L)
            suggestedTxDao.deleteOlderThan(sevenDaysAgo)
            suggestedTxDao.clearProcessed()
        }
    }
}
