package com.expense.app.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.expense.app.data.cloud.FirestoreSync
import com.expense.app.data.local.AppDatabase
import com.expense.app.data.local.entity.PendingSyncEntity
import com.expense.app.data.model.*
import com.expense.app.data.remote.RetrofitClient
import com.expense.app.data.remote.TokenManager
import com.expense.app.data.sync.SyncScheduler
import com.google.gson.Gson
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

data class SettingsUiState(
    val isLoading: Boolean = false,
    val budgets: List<Budget> = emptyList(),
    val categories: List<Category> = emptyList(),
    val successMsg: String? = null,
    val errorMsg: String? = null,
    // ── Offline Sync Fields ────────────────────
    val pendingCount: Int = 0,
    val isOffline: Boolean = false
)

class SettingsViewModel(app: Application) : AndroidViewModel(app) {
    private val api = RetrofitClient.create(app)
    private val ctx = app.applicationContext

    // ── Offline Sync Dependencies ──────────────
    private val localDb = AppDatabase.getInstance(app)
    private val pendingSyncDao = localDb.pendingSyncDao()
    private val firestoreSync = FirestoreSync.getInstance()
    private val gson = Gson()

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    fun loadBudgets() {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val budgetsRes = api.getBudgets(userId)
                val catsRes = api.getCategories()
                val pendingCount = pendingSyncDao.getPendingCount()
                _state.value = _state.value.copy(
                    isLoading = false,
                    budgets = budgetsRes.body() ?: emptyList(),
                    categories = catsRes.body() ?: emptyList(),
                    pendingCount = pendingCount,
                    isOffline = false
                )
            } catch (e: Exception) {
                Log.e("SettingsVM", "loadBudgets error", e)
                val isConnectionError = e is java.net.ConnectException
                        || e is java.net.SocketTimeoutException
                        || e is java.net.UnknownHostException
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMsg = if (isConnectionError) "Server đang offline" else e.localizedMessage,
                    isOffline = isConnectionError
                )
            }
        }
    }

    fun updateProfile(name: String, email: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, successMsg = null, errorMsg = null)
            try {
                val res = api.updateProfile(UpdateProfileRequest(name, email))
                if (res.isSuccessful && res.body() != null) {
                    val user = res.body()!!.user
                    TokenManager.saveUser(ctx, user.id, user.full_name)
                    _state.value = _state.value.copy(isLoading = false, successMsg = "Cập nhật thành công!")
                } else {
                    _state.value = _state.value.copy(isLoading = false, errorMsg = "Cập nhật thất bại")
                }
            } catch (e: Exception) {
                Log.e("SettingsVM", "updateProfile error", e)
                _state.value = _state.value.copy(isLoading = false, errorMsg = "Lỗi kết nối: ${e.localizedMessage}")
            }
        }
    }

    fun changePassword(currentPassword: String, newPassword: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, successMsg = null, errorMsg = null)
            try {
                val res = api.changePassword(ChangePasswordRequest(currentPassword, newPassword))
                if (res.isSuccessful) {
                    _state.value = _state.value.copy(isLoading = false, successMsg = "Đổi mật khẩu thành công!")
                } else {
                    val err = res.errorBody()?.string() ?: "Thất bại"
                    _state.value = _state.value.copy(isLoading = false, errorMsg = err)
                }
            } catch (e: Exception) {
                Log.e("SettingsVM", "changePassword error", e)
                _state.value = _state.value.copy(isLoading = false, errorMsg = "Lỗi kết nối")
            }
        }
    }

    /**
     * Tạo ngân sách mới — hỗ trợ offline-first.
     */
    fun createBudget(categoryId: String, amount: Double, period: String) {
        val userId = TokenManager.getUserIdSync(ctx) ?: return
        viewModelScope.launch {
            try {
                api.createBudget(CreateBudgetRequest(userId, categoryId, amount, period))
                loadBudgets()
            } catch (e: Exception) {
                Log.w("SettingsVM", "createBudget online failed, going offline", e)

                // ── OFFLINE PATH ──────────────────────────
                val request = CreateBudgetRequest(userId, categoryId, amount, period)
                val localId = UUID.randomUUID().toString()

                val pendingItem = PendingSyncEntity(
                    localId = localId,
                    action = "CREATE",
                    entityType = "budget",
                    payload = gson.toJson(request),
                    userId = userId
                )

                pendingSyncDao.insert(pendingItem)

                try {
                    val docId = firestoreSync.pushToCloud(pendingItem)
                    pendingSyncDao.updateFirebaseDocId(localId, docId)
                } catch (fireErr: Exception) {
                    Log.w("SettingsVM", "Firestore push failed", fireErr)
                }

                SyncScheduler.scheduleOneTime(ctx)

                val pendingCount = pendingSyncDao.getPendingCount()
                _state.value = _state.value.copy(
                    pendingCount = pendingCount,
                    isOffline = true,
                    successMsg = "Đã lưu tạm — sẽ đồng bộ khi có kết nối"
                )
            }
        }
    }

    /**
     * Xóa ngân sách — hỗ trợ offline-first.
     */
    fun deleteBudget(id: String) {
        viewModelScope.launch {
            try {
                api.deleteBudget(id)
                _state.value = _state.value.copy(
                    budgets = _state.value.budgets.filter { it.id != id }
                )
            } catch (e: Exception) {
                Log.w("SettingsVM", "deleteBudget online failed, going offline", e)

                // ── OFFLINE PATH ──────────────────────────
                val userId = TokenManager.getUserIdSync(ctx) ?: return@launch
                val localId = UUID.randomUUID().toString()

                val pendingItem = PendingSyncEntity(
                    localId = localId,
                    action = "DELETE",
                    entityType = "budget",
                    payload = """{"id":"$id"}""",
                    userId = userId
                )

                pendingSyncDao.insert(pendingItem)

                try {
                    firestoreSync.pushToCloud(pendingItem)
                } catch (fireErr: Exception) {
                    Log.w("SettingsVM", "Firestore push failed", fireErr)
                }

                SyncScheduler.scheduleOneTime(ctx)

                // Optimistic UI update
                _state.value = _state.value.copy(
                    budgets = _state.value.budgets.filter { it.id != id },
                    isOffline = true,
                    successMsg = "Đã lưu tạm — sẽ đồng bộ khi có kết nối"
                )
            }
        }
    }

    fun clearMessage() {
        _state.value = _state.value.copy(successMsg = null, errorMsg = null)
    }
}
