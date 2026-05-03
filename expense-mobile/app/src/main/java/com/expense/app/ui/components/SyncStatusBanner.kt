package com.expense.app.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.viewmodel.SyncStatus

/**
 * Banner hiển thị trạng thái sync cho người dùng.
 *
 * - 🟢 Online & synced – Ẩn banner
 * - 🟡 Có pending items – Hiển thị số lượng chờ sync
 * - 🔴 Offline – Hiển thị cảnh báo offline
 * - 🔵 Đang sync – Hiển thị animation loading
 */
@Composable
fun SyncStatusBanner(
    isOffline: Boolean,
    pendingCount: Int,
    syncStatus: SyncStatus,
    onSyncClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val shouldShow = isOffline || pendingCount > 0 || syncStatus == SyncStatus.SYNCING

    AnimatedVisibility(
        visible = shouldShow,
        enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
        exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
        modifier = modifier
    ) {
        val (bgBrush, iconTint, textColor, statusText, statusIcon) = when {
            syncStatus == SyncStatus.SYNCING -> BannerStyle(
                bgBrush = Brush.horizontalGradient(
                    listOf(Color(0xFF1E3A5F), Color(0xFF1E40AF))
                ),
                iconTint = Color(0xFF60A5FA),
                textColor = Color(0xFFBFDBFE),
                statusText = "Đang đồng bộ $pendingCount mục...",
                statusIcon = Icons.Rounded.Sync
            )
            isOffline -> BannerStyle(
                bgBrush = Brush.horizontalGradient(
                    listOf(Color(0xFF78350F), Color(0xFF92400E))
                ),
                iconTint = Color(0xFFFBBF24),
                textColor = Color(0xFFFEF3C7),
                statusText = if (pendingCount > 0)
                    "Offline • $pendingCount mục chờ đồng bộ"
                else
                    "Đang offline — dữ liệu sẽ lưu tạm",
                statusIcon = Icons.Rounded.CloudOff
            )
            pendingCount > 0 -> BannerStyle(
                bgBrush = Brush.horizontalGradient(
                    listOf(Color(0xFF064E3B), Color(0xFF065F46))
                ),
                iconTint = Color(0xFF34D399),
                textColor = Color(0xFFD1FAE5),
                statusText = "$pendingCount mục chờ đồng bộ",
                statusIcon = Icons.Rounded.CloudQueue
            )
            else -> BannerStyle(
                bgBrush = Brush.horizontalGradient(
                    listOf(Color(0xFF064E3B), Color(0xFF065F46))
                ),
                iconTint = Color(0xFF34D399),
                textColor = Color(0xFFD1FAE5),
                statusText = "",
                statusIcon = Icons.Rounded.CloudDone
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(bgBrush)
                .clickable(onClick = onSyncClick)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Animated sync icon
            if (syncStatus == SyncStatus.SYNCING) {
                val rotation by rememberInfiniteTransition(label = "sync_rotate")
                    .animateFloat(
                        initialValue = 0f,
                        targetValue = 360f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(1200, easing = LinearEasing)
                        ),
                        label = "rotation"
                    )
                Icon(
                    imageVector = statusIcon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier
                        .size(18.dp)
                        .rotate(rotation)
                )
            } else {
                Icon(
                    imageVector = statusIcon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(Modifier.width(10.dp))

            Text(
                text = statusText,
                color = textColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )

            // Nút retry nếu đang offline + có pending items
            if (isOffline && pendingCount > 0 && syncStatus != SyncStatus.SYNCING) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.15f))
                        .clickable(onClick = onSyncClick)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Thử lại",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Dot indicator cho pending count
            if (pendingCount > 0 && !isOffline) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .clip(CircleShape)
                        .background(iconTint.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$pendingCount",
                        color = iconTint,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

/**
 * Data class cho style của banner dựa trên trạng thái.
 */
private data class BannerStyle(
    val bgBrush: Brush,
    val iconTint: Color,
    val textColor: Color,
    val statusText: String,
    val statusIcon: androidx.compose.ui.graphics.vector.ImageVector
)
