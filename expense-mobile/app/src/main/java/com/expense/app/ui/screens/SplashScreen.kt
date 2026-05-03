package com.expense.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onFinished: () -> Unit) {

    // ── Animations
    val logoScale by animateFloatAsState(
        targetValue = 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "logoScale"
    )
    val infiniteTransition = rememberInfiniteTransition(label = "splash")

    // Pulse ring
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f, targetValue = 1.3f, label = "pulse",
        animationSpec = infiniteRepeatable(tween(1200, easing = EaseInOut), RepeatMode.Reverse)
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f, targetValue = 0f, label = "pulseA",
        animationSpec = infiniteRepeatable(tween(1200, easing = EaseInOut), RepeatMode.Reverse)
    )

    // Floating dots
    val dot1Y by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = -12f, label = "d1",
        animationSpec = infiniteRepeatable(tween(1000, delayMillis = 0, easing = EaseInOut), RepeatMode.Reverse)
    )
    val dot2Y by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = -12f, label = "d2",
        animationSpec = infiniteRepeatable(tween(1000, delayMillis = 300, easing = EaseInOut), RepeatMode.Reverse)
    )
    val dot3Y by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = -12f, label = "d3",
        animationSpec = infiniteRepeatable(tween(1000, delayMillis = 600, easing = EaseInOut), RepeatMode.Reverse)
    )

    // Text fade-in
    var textAlpha by remember { mutableFloatStateOf(0f) }
    var subtitleAlpha by remember { mutableFloatStateOf(0f) }
    var taglineAlpha by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(Unit) {
        delay(300)
        textAlpha = 1f
        delay(300)
        subtitleAlpha = 1f
        delay(400)
        taglineAlpha = 1f
        delay(1800)
        onFinished()
    }

    val textAlphaAnim by animateFloatAsState(textAlpha, tween(600), label = "ta")
    val subtitleAlphaAnim by animateFloatAsState(subtitleAlpha, tween(600), label = "sa")
    val taglineAlphaAnim by animateFloatAsState(taglineAlpha, tween(800), label = "ga")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    listOf(GradientDarkStart, GradientGreenMid, GradientGreenStart),
                    start = Offset(0f, 0f), end = Offset(1000f, 1800f)
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        // ── Background art: large faded circles
        Box(
            Modifier.size(400.dp).offset(x = 120.dp, y = (-180).dp)
                .clip(CircleShape).background(Color.White.copy(alpha = 0.03f))
        )
        Box(
            Modifier.size(280.dp).offset(x = (-100).dp, y = 200.dp)
                .clip(CircleShape).background(Color.White.copy(alpha = 0.04f))
        )
        Box(
            Modifier.size(180.dp).offset(x = 140.dp, y = 250.dp)
                .clip(CircleShape).background(Color.White.copy(alpha = 0.03f))
        )

        // ── Art: floating stat cards (decorative)
        Box(Modifier.fillMaxSize()) {
            // Top-left card art
            Box(
                Modifier.align(Alignment.TopStart).offset(x = 24.dp, y = 80.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White.copy(alpha = 0.07f))
                    .padding(12.dp)
            ) {
                Column {
                    Text("Thu nhập", fontSize = 9.sp, color = Color.White.copy(alpha = 0.6f))
                    Text("+5.2tr", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF6EE7B7))
                }
            }
            // Bottom-right card art  
            Box(
                Modifier.align(Alignment.BottomEnd).offset(x = (-24).dp, y = (-120).dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White.copy(alpha = 0.07f))
                    .padding(12.dp)
            ) {
                Column {
                    Text("Tiết kiệm", fontSize = 9.sp, color = Color.White.copy(alpha = 0.6f))
                    Text("🎯 85%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF93C5FD))
                }
            }
            // Mid-right chart art
            Box(
                Modifier.align(Alignment.CenterEnd).offset(x = (-16).dp, y = 80.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.06f))
                    .padding(10.dp)
            ) {
                Text("📊", fontSize = 22.sp)
            }
        }

        // ── Main center content
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Pulse ring + Logo
            Box(contentAlignment = Alignment.Center) {
                // Outer pulse ring
                Box(
                    Modifier.size(100.dp).scale(pulseScale).alpha(pulseAlpha)
                        .clip(CircleShape).background(Color.White.copy(alpha = 0.15f))
                )
                // Logo circle
                Box(
                    Modifier.size(84.dp).scale(logoScale).clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.18f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("💰", fontSize = 40.sp)
                }
            }

            Spacer(Modifier.height(28.dp))

            // App name
            Text(
                "MoneyTrack",
                fontSize = 32.sp, fontWeight = FontWeight.ExtraBold, color = Color.White,
                modifier = Modifier.alpha(textAlphaAnim)
            )

            Text(
                "Quản lý tài chính thông minh",
                fontSize = 14.sp, color = Color.White.copy(alpha = 0.75f),
                modifier = Modifier.padding(top = 6.dp).alpha(subtitleAlphaAnim)
            )

            Spacer(Modifier.height(48.dp))

            // Animated loading dots
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.alpha(taglineAlphaAnim)
            ) {
                listOf(dot1Y, dot2Y, dot3Y).forEach { offsetY ->
                    Box(
                        Modifier.size(8.dp).offset(y = offsetY.dp)
                            .clip(CircleShape).background(Color.White.copy(alpha = 0.6f))
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Tagline features
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.alpha(taglineAlphaAnim)
            ) {
                listOf("📊 Phân tích chi tiêu thông minh", "🎯 Đặt mục tiêu tiết kiệm", "🤖 Trợ lý AI tài chính").forEach {
                    Text(it, fontSize = 12.sp, color = Color.White.copy(alpha = 0.65f),
                        modifier = Modifier.padding(vertical = 2.dp))
                }
            }
        }

        // ── Bottom: version info
        Column(
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Phiên bản 1.0.0", fontSize = 11.sp, color = Color.White.copy(alpha = 0.4f))
            Text("Powered by Gemini AI", fontSize = 11.sp, color = Color.White.copy(alpha = 0.4f),
                modifier = Modifier.padding(top = 2.dp))
        }
    }
}
