package com.expense.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.local.entity.SuggestedTransactionEntity
import com.expense.app.ui.theme.*
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

// ── Bank Brand Colors
private val bankColors = mapOf(
    "Vietcombank" to Color(0xFF006A4E),
    "Techcombank" to Color(0xFFBD0022),
    "BIDV" to Color(0xFF0033A0),
    "VietinBank" to Color(0xFF00388D),
    "MB Bank" to Color(0xFF0064B0),
    "MoMo" to Color(0xFFAE2070),
    "ZaloPay" to Color(0xFF008FE5),
    "TPBank" to Color(0xFF5C2D91)
)

private val bankEmojis = mapOf(
    "Vietcombank" to "🏦",
    "Techcombank" to "🏧",
    "BIDV" to "🏛️",
    "VietinBank" to "🏛️",
    "MB Bank" to "🔵",
    "MoMo" to "💜",
    "ZaloPay" to "💙",
    "TPBank" to "🟣"
)

private fun fmtVND(v: Double): String {
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    return "${fmt.format(v)} đ"
}

private fun fmtTime(millis: Long): String {
    val sdf = SimpleDateFormat("HH:mm · dd/MM", Locale.getDefault())
    return sdf.format(Date(millis))
}

/**
 * Bottom Sheet hiển thị danh sách giao dịch tự động nhận diện.
 * User có thể: ✅ Chấp nhận | ✏️ Chỉnh sửa | ❌ Bỏ qua
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuggestedTransactionsSheet(
    suggestions: List<SuggestedTransactionEntity>,
    onApprove: (SuggestedTransactionEntity) -> Unit,
    onReject: (SuggestedTransactionEntity) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = BackgroundSlate,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(PrimaryGreenSurface),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Rounded.AutoAwesome,
                        contentDescription = null,
                        tint = PrimaryGreen,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        "Giao dịch nhận diện",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = TextPrimary
                    )
                    Text(
                        "${suggestions.size} giao dịch chờ xác nhận",
                        fontSize = 13.sp,
                        color = TextMuted
                    )
                }
            }

            Divider(color = BorderGray, thickness = 0.5.dp)
            Spacer(Modifier.height(12.dp))

            if (suggestions.isEmpty()) {
                // Empty state
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("✨", fontSize = 40.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Không có giao dịch mới",
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                        Text(
                            "Các giao dịch từ ngân hàng sẽ xuất hiện ở đây",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.heightIn(max = 500.dp)
                ) {
                    items(suggestions, key = { it.id }) { suggestion ->
                        SuggestionCard(
                            suggestion = suggestion,
                            onApprove = { onApprove(suggestion) },
                            onReject = { onReject(suggestion) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SuggestionCard(
    suggestion: SuggestedTransactionEntity,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    val isIncome = suggestion.type == "income"
    val amountColor = if (isIncome) PrimaryGreen else DangerRose
    val amountBg = if (isIncome) PrimaryGreenSurface else DangerLight
    val prefix = if (isIncome) "+" else "-"
    val bankColor = bankColors[suggestion.bankName] ?: TextSecondary
    val bankEmoji = bankEmojis[suggestion.bankName] ?: "🏦"

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Top row: bank + amount
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Bank icon
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(bankColor.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(bankEmoji, fontSize = 18.sp)
                }

                Spacer(Modifier.width(12.dp))

                // Bank name + time
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        suggestion.bankName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = TextPrimary
                    )
                    Text(
                        fmtTime(suggestion.createdAt),
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }

                // Amount
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        "$prefix${fmtVND(suggestion.amount)}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = amountColor
                    )
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(amountBg)
                            .padding(horizontal = 6.dp, vertical = 1.dp)
                    ) {
                        Text(
                            if (isIncome) "Thu" else "Chi",
                            fontSize = 10.sp,
                            color = amountColor,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(Modifier.height(10.dp))

            // Description
            Text(
                suggestion.description,
                fontSize = 13.sp,
                color = TextSecondary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )

            // Category suggestion
            if (suggestion.suggestedCategoryName != null) {
                Spacer(Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Rounded.AutoAwesome,
                        contentDescription = null,
                        tint = WarningAmber,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        suggestion.suggestedCategoryName,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WarningAmber
                    )
                    if (suggestion.confidence > 0) {
                        Text(
                            "· ${(suggestion.confidence * 100).toInt()}%",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                }
            }

            // Balance after (if available)
            if (suggestion.balanceAfter != null) {
                Spacer(Modifier.height(4.dp))
                Text(
                    "Số dư: ${fmtVND(suggestion.balanceAfter)}",
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }

            Spacer(Modifier.height(12.dp))

            // Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Reject button
                OutlinedButton(
                    onClick = onReject,
                    modifier = Modifier.weight(1f).height(40.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderGray),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary)
                ) {
                    Icon(Icons.Rounded.Close, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Bỏ qua", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                // Approve button
                Button(
                    onClick = onApprove,
                    modifier = Modifier.weight(1f).height(40.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Icon(Icons.Rounded.Check, null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Lưu giao dịch", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/**
 * Badge hiển thị số giao dịch chờ xác nhận — gắn trên notification icon ở Dashboard.
 */
@Composable
fun SuggestedTransactionBadge(
    count: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (count <= 0) return

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(PrimaryGreen)
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Rounded.AutoAwesome,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(14.dp)
            )
            Spacer(Modifier.width(4.dp))
            Text(
                "$count giao dịch mới",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}
