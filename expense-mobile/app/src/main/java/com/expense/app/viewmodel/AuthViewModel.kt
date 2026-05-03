package com.expense.app.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.expense.app.data.model.LoginRequest
import com.expense.app.data.model.RegisterRequest
import com.expense.app.data.model.User
import com.expense.app.data.remote.RetrofitClient
import com.expense.app.data.remote.TokenManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

class AuthViewModel(app: Application) : AndroidViewModel(app) {
    private val api = RetrofitClient.create(app)
    private val ctx = app.applicationContext

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            val token = TokenManager.getTokenSync(ctx)
            if (token != null) {
                try {
                    val res = api.getMe("Bearer $token")
                    Log.d("AuthVM", "checkSession /me code=${res.code()}")
                    if (res.isSuccessful && res.body() != null) {
                        val user = res.body()!!.user
                        TokenManager.saveUser(ctx, user.id, user.full_name)
                        _state.value = AuthUiState(isLoggedIn = true, user = user)
                    } else {
                        // Token expired → clear
                        TokenManager.clear(ctx)
                    }
                } catch (e: Exception) {
                    Log.e("AuthVM", "checkSession error", e)
                }
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val res = api.login(LoginRequest(email, password))
                Log.d("AuthVM", "login code=${res.code()} body=${res.body()}")
                if (res.isSuccessful && res.body() != null) {
                    val body = res.body()!!
                    TokenManager.saveToken(ctx, body.token)
                    TokenManager.saveUser(ctx, body.user.id, body.user.full_name)
                    _state.value = AuthUiState(isLoggedIn = true, user = body.user)
                } else {
                    val errBody = res.errorBody()?.string() ?: "Unknown error"
                    Log.e("AuthVM", "login failed: $errBody")
                    _state.value = _state.value.copy(isLoading = false, error = "Email hoặc mật khẩu không đúng")
                }
            } catch (e: Exception) {
                Log.e("AuthVM", "login exception", e)
                _state.value = _state.value.copy(isLoading = false, error = "Lỗi kết nối: ${e.localizedMessage}")
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val res = api.register(RegisterRequest(name, email, password))
                Log.d("AuthVM", "register code=${res.code()}")
                if (res.isSuccessful && res.body() != null) {
                    val body = res.body()!!
                    TokenManager.saveToken(ctx, body.token)
                    TokenManager.saveUser(ctx, body.user.id, body.user.full_name)
                    _state.value = AuthUiState(isLoggedIn = true, user = body.user)
                } else {
                    val errBody = res.errorBody()?.string() ?: "Unknown error"
                    Log.e("AuthVM", "register failed: $errBody")
                    _state.value = _state.value.copy(isLoading = false, error = "Đăng ký thất bại")
                }
            } catch (e: Exception) {
                Log.e("AuthVM", "register exception", e)
                _state.value = _state.value.copy(isLoading = false, error = "Lỗi kết nối: ${e.localizedMessage}")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            TokenManager.clear(ctx)
            _state.value = AuthUiState()
        }
    }
}
