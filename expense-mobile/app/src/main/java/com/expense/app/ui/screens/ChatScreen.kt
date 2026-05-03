package com.expense.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.ChatMessage
import com.expense.app.ui.theme.*
import com.expense.app.viewmodel.ChatViewModel
import kotlinx.coroutines.launch

// ── Quick suggestion chips
private val quickSuggestions = listOf(
    "💰 Tôi nên tiết kiệm bao nhiêu?",
    "📊 Chi tiêu tháng này thế nào?",
    "🎯 Lời khuyên quản lý ngân sách",
    "📈 Cách tăng thu nhập hiệu quả",
    "💳 Cách giảm chi tiêu không cần thiết"
)

@Composable
fun ChatScreen(chatVm: ChatViewModel) {
    val state by chatVm.state.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val listState   = rememberLazyListState()
    val scope       = rememberCoroutineScope()
    val focusMgr    = LocalFocusManager.current

    // Auto-scroll to bottom when new message arrives
    LaunchedEffect(state.messages.size) {
        if (state.messages.isNotEmpty()) {
            scope.launch { listState.animateScrollToItem(state.messages.size - 1) }
        }
    }

    val cs = MaterialTheme.colorScheme
    Column(modifier = Modifier.fillMaxSize().background(cs.background)) {

        // ══════════════════════════════════
        // 1. HEADER — brand gradient (mode-independent)
        // ══════════════════════════════════
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF1D4ED8), Color(0xFF059669)),
                        start = Offset(0f, 0f), end = Offset(1000f, 200f)
                    )
                )
        ) {
            // Decorative circle
            Box(
                Modifier.size(140.dp).offset(x = 260.dp, y = (-40).dp)
                    .clip(CircleShape).background(Color.White.copy(alpha = 0.05f))
            )

            Row(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // AI Avatar
                Box(
                    Modifier.size(46.dp).clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🤖", fontSize = 22.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("Trợ lý AI Tài chính", fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold, color = Color.White)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier.size(7.dp).clip(CircleShape)
                                .background(Color(0xFF4ADE80)) // Green dot = online
                        )
                        Spacer(Modifier.width(5.dp))
                        Text(
                            if (state.isLoading) "Đang suy nghĩ..." else "Trực tuyến · Powered by Gemini",
                            fontSize = 11.sp, color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
                // Clear chat button
                if (state.messages.size > 1) {
                    Box(
                        Modifier.size(36.dp).clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.12f))
                            .clickable { chatVm.clearMessages() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Rounded.Refresh, null, tint = Color.White, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        // ══════════════════════════════════
        // 2. MESSAGE LIST
        // ══════════════════════════════════
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(state.messages) { msg ->
                ChatBubble(msg)
            }

            // Typing indicator (animated dots)
            if (state.isLoading) {
                item {
                    Row(verticalAlignment = Alignment.Bottom) {
                        AIAvatar()
                        Spacer(Modifier.width(8.dp))
                        TypingIndicator()
                    }
                }
            }
        }

        // ══════════════════════════════════
        // 3. QUICK SUGGESTIONS (show when empty)
        // ══════════════════════════════════
        if (state.messages.size <= 1 && !state.isLoading) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(quickSuggestions) { hint ->
                    SuggestionChip(
                        text = hint,
                        onClick = {
                            chatVm.sendMessage(hint.drop(2).trim()) // strip emoji prefix
                            focusMgr.clearFocus()
                        }
                    )
                }
            }
        }

        // ══════════════════════════════════
        // 4. INPUT BAR — sticky bottom
        // ══════════════════════════════════
        Surface(
            color = cs.surface,
            shadowElevation = 12.dp,
            shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text("Hỏi về tài chính của bạn...", fontSize = 14.sp, color = cs.onSurfaceVariant)
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        maxLines = 4,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(
                            onSend = {
                                if (inputText.isNotBlank() && !state.isLoading) {
                                    chatVm.sendMessage(inputText.trim())
                                    inputText = ""
                                    focusMgr.clearFocus()
                                }
                            }
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = cs.secondary,
                            unfocusedBorderColor = cs.outline,
                            focusedContainerColor = cs.background,
                            unfocusedContainerColor = cs.background,
                            cursorColor = cs.secondary
                        )
                    )

                    val canSend = inputText.isNotBlank() && !state.isLoading
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (canSend) cs.secondary else cs.outline.copy(alpha = 0.3f)
                            )
                            .clickable(enabled = canSend) {
                                chatVm.sendMessage(inputText.trim())
                                inputText = ""
                                focusMgr.clearFocus()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (state.isLoading) {
                            CircularProgressIndicator(
                                color = Color.White, strokeWidth = 2.dp,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Icon(
                                Icons.Rounded.Send, null,
                                tint = if (canSend) Color.White else cs.onSurfaceVariant,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                if (inputText.isNotBlank()) {
                    Text(
                        "${inputText.length} ký tự · Nhấn ↵ để gửi",
                        fontSize = 10.sp, color = cs.onSurfaceVariant,
                        modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════
//  COMPONENTS
// ═══════════════════════════════

@Composable
private fun ChatBubble(msg: ChatMessage) {
    val cs = MaterialTheme.colorScheme
    if (msg.isUser) {
        Row(
            Modifier.fillMaxWidth().padding(start = 48.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Column(horizontalAlignment = Alignment.End) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp, 4.dp, 18.dp, 18.dp))
                        .background(cs.secondary)
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Text(msg.text, color = cs.onSecondary, fontSize = 14.sp, lineHeight = 20.sp)
                }
                Text(
                    msg.timestamp,
                    fontSize = 9.sp,
                    color = cs.onSurfaceVariant,
                    modifier = Modifier.padding(top = 2.dp, end = 2.dp)
                )
            }
        }
    } else {
        Row(
            Modifier.fillMaxWidth().padding(end = 48.dp),
            verticalAlignment = Alignment.Bottom
        ) {
            AIAvatar()
            Spacer(Modifier.width(8.dp))
            Column {
                Card(
                    shape = RoundedCornerShape(4.dp, 18.dp, 18.dp, 18.dp),
                    colors = CardDefaults.cardColors(containerColor = cs.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                        if (msg.text.startsWith("Xin chào")) {
                            Row(verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(bottom = 6.dp)) {
                                Text("✨", fontSize = 11.sp)
                                Spacer(Modifier.width(4.dp))
                                Text("Gemini AI", fontSize = 10.sp, fontWeight = FontWeight.Bold,
                                    color = cs.secondary)
                            }
                        }
                        Text(msg.text, fontSize = 14.sp, color = cs.onSurface, lineHeight = 21.sp)
                    }
                }
                Text(
                    msg.timestamp,
                    fontSize = 9.sp,
                    color = cs.onSurfaceVariant,
                    modifier = Modifier.padding(top = 2.dp, start = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun AIAvatar() {
    val cs = MaterialTheme.colorScheme
    Box(
        Modifier.size(32.dp).clip(CircleShape).background(cs.secondaryContainer),
        contentAlignment = Alignment.Center
    ) {
        Text("🤖", fontSize = 14.sp)
    }
}

@Composable
private fun TypingIndicator() {
    // Animated pulsing dots
    val infiniteTransition = rememberInfiniteTransition(label = "typing")
    val dot1 by infiniteTransition.animateFloat(
        initialValue = 0.4f, targetValue = 1f, label = "d1",
        animationSpec = infiniteRepeatable(tween(600), RepeatMode.Reverse)
    )
    val dot2 by infiniteTransition.animateFloat(
        initialValue = 0.4f, targetValue = 1f, label = "d2",
        animationSpec = infiniteRepeatable(tween(600, delayMillis = 150), RepeatMode.Reverse)
    )
    val dot3 by infiniteTransition.animateFloat(
        initialValue = 0.4f, targetValue = 1f, label = "d3",
        animationSpec = infiniteRepeatable(tween(600, delayMillis = 300), RepeatMode.Reverse)
    )

    val cs = MaterialTheme.colorScheme
    Card(
        shape = RoundedCornerShape(4.dp, 18.dp, 18.dp, 18.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 18.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(Modifier.size(7.dp).scale(dot1).clip(CircleShape).background(cs.secondary))
            Box(Modifier.size(7.dp).scale(dot2).clip(CircleShape).background(cs.secondary))
            Box(Modifier.size(7.dp).scale(dot3).clip(CircleShape).background(cs.secondary))
        }
    }
}

@Composable
private fun SuggestionChip(text: String, onClick: () -> Unit) {
    val cs = MaterialTheme.colorScheme
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(cs.surface)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        Text(
            text, fontSize = 12.sp, color = cs.secondary,
            fontWeight = FontWeight.Medium, maxLines = 1
        )
    }
}
