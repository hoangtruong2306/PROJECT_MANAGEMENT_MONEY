package com.expense.app.viewmodel

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.expense.app.data.model.ChatMessage
import com.expense.app.data.model.ChatRequest
import com.expense.app.data.remote.RetrofitClient
import com.expense.app.data.remote.TokenManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class ChatViewModel(app: Application) : AndroidViewModel(app) {
    private val api = RetrofitClient.create(app)
    private val ctx = app.applicationContext

    private val _state = MutableStateFlow(ChatUiState(
        messages = listOf(
            ChatMessage(
                text = "Xin chào! Tôi là trợ lý tài chính AI của bạn 🤖\n\nTôi có thể giúp bạn:\n• Phân tích thu chi\n• Đưa ra lời khuyên tiết kiệm\n• Gợi ý cách quản lý ngân sách\n\nBạn muốn hỏi gì hôm nay?",
                isUser = false
            )
        )
    ))
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        // Add user message immediately
        val userMsg = ChatMessage(text = text, isUser = true)
        _state.value = _state.value.copy(
            messages = _state.value.messages + userMsg,
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            try {
                val token = TokenManager.getTokenSync(ctx) ?: run {
                    _state.value = _state.value.copy(isLoading = false, error = "Chưa đăng nhập")
                    return@launch
                }
                val res = api.sendChat(ChatRequest(text))
                Log.d("ChatVM", "sendChat code=${res.code()}")
                if (res.isSuccessful && res.body() != null) {
                    val aiMsg = ChatMessage(text = res.body()!!.reply, isUser = false)
                    _state.value = _state.value.copy(
                        messages = _state.value.messages + aiMsg,
                        isLoading = false
                    )
                } else {
                    val errBody = res.errorBody()?.string() ?: "Lỗi không xác định"
                    val errMsg = ChatMessage(text = "❌ Không thể kết nối AI. Thử lại sau nhé!", isUser = false)
                    _state.value = _state.value.copy(
                        messages = _state.value.messages + errMsg,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                Log.e("ChatVM", "sendMessage error", e)
                val errMsg = ChatMessage(text = "❌ Lỗi kết nối: ${e.localizedMessage}", isUser = false)
                _state.value = _state.value.copy(
                    messages = _state.value.messages + errMsg,
                    isLoading = false
                )
            }
        }
    }

    fun clearMessages() {
        _state.value = ChatUiState(
            messages = listOf(
                ChatMessage(
                    text = "Xin chào! Tôi là trợ lý tài chính AI của bạn 🤖\n\nTôi có thể giúp bạn:\n• Phân tích thu chi\n• Đưa ra lời khuyên tiết kiệm\n• Gợi ý cách quản lý ngân sách\n\nBạn muốn hỏi gì hôm nay?",
                    isUser = false
                )
            )
        )
    }
}
