package com.expense.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.Category
import com.expense.app.data.model.Transaction
import com.expense.app.ui.components.SuggestedTransactionBadge
import com.expense.app.ui.components.SuggestedTransactionsSheet
import com.expense.app.ui.components.SyncStatusBanner
import com.expense.app.ui.theme.*
import com.expense.app.viewmodel.DashboardUiState
import com.expense.app.viewmodel.SyncStatus
import java.text.NumberFormat
import java.util.Locale

private fun formatVND(amount: Double): String {
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    return "${fmt.format(amount)} đ"
}

@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onSyncClick: () -> Unit = {},
    onApproveSuggestion: (com.expense.app.data.local.entity.SuggestedTransactionEntity) -> Unit = {},
    onRejectSuggestion: (com.expense.app.data.local.entity.SuggestedTransactionEntity) -> Unit = {},
    onLoadSuggestions: () -> Unit = {}
) {
    val cs = MaterialTheme.colorScheme
    val isDark = LocalDarkTheme.current

    var showBalance by remember { mutableStateOf(true) }
    var showSuggestionsSheet by remember { mutableStateOf(false) }

    val today = remember {
        java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            .format(java.util.Date())
    }
    val todayExpense = remember(state.allTransactions) {
        state.allTransactions
            .filter { it.transaction_date == today && it.type == "expense" }
            .sumOf { it.amount }
    }
    val trendPercent = remember(state.stats) {
        val thisMonth = state.stats?.expense_this_month ?: 0.0
        val lastMonth = state.stats?.expense_last_month ?: 0.0
        if (lastMonth > 0) ((thisMonth - lastMonth) / lastMonth * 100) else 0.0
    }
    val trendUp = trendPercent >= 0

    if (state.isLoading) {
        Box(
            Modifier.fillMaxSize().background(cs.background),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = cs.secondary, strokeWidth = 2.5.dp)
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(cs.background),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        item {
            SyncStatusBanner(
                isOffline    = state.isOffline,
                pendingCount = state.pendingCount,
                syncStatus   = state.syncStatus,
                onSyncClick  = onSyncClick
            )
        }

        if (state.suggestedCount > 0) {
            item {
                SuggestedTransactionBadge(
                    count   = state.suggestedCount,
                    onClick = { onLoadSuggestions(); showSuggestionsSheet = true },
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
                )
            }
        }

        item { TopHeader(cs) }

        item {
            BalanceHeroCard(
                balance      = state.stats?.balance       ?: 0.0,
                income       = state.stats?.total_income  ?: 0.0,
                expense      = state.stats?.total_expense ?: 0.0,
                show         = showBalance,
                onToggle     = { showBalance = !showBalance },
                trendPercent = trendPercent,
                trendUp      = trendUp,
                isDark       = isDark
            )
        }

        item {
            Row(
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                QuickStatCard(
                    label    = "Giao dịch",
                    value    = "${state.stats?.transaction_count ?: 0}",
                    icon     = Icons.Rounded.Receipt,
                    tint     = cs.primary,
                    bgTint   = cs.primaryContainer,
                    cs       = cs,
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    label    = "Ví tiền",
                    value    = "${state.wallets.size}",
                    icon     = Icons.Rounded.AccountBalanceWallet,
                    tint     = Amber,
                    bgTint   = if (isDark) AmberSurfDark else AmberSurface,
                    cs       = cs,
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    label    = "Hôm nay",
                    value    = formatVND(todayExpense),
                    icon     = Icons.Rounded.Today,
                    tint     = if (todayExpense > 0) cs.tertiary else cs.secondary,
                    bgTint   = if (todayExpense > 0)
                        (if (isDark) RoseSurfDark else RoseSurface)
                    else
                        (if (isDark) EmeraldSurfDark else EmeraldSurface),
                    cs       = cs,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .padding(top = 28.dp, bottom = 4.dp),
                verticalAlignment    = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        "Giao dịch gần đây",
                        fontSize   = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color      = cs.onBackground
                    )
                    Text(
                        "Cập nhật mới nhất",
                        fontSize = 12.sp,
                        color    = cs.onSurfaceVariant
                    )
                }
                TextButton(onClick = {}) {
                    Text(
                        "Xem tất cả",
                        fontSize   = 12.sp,
                        color      = cs.secondary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        if (state.recentTransactions.isEmpty()) {
            item { EmptyTransactions(cs) }
        } else {
            items(state.recentTransactions.take(8)) { tx ->
                TransactionItem(tx = tx, categories = state.categories, cs = cs, isDark = isDark)
            }
        }
    }

    if (showSuggestionsSheet) {
        SuggestedTransactionsSheet(
            suggestions = state.suggestedTransactions,
            onApprove   = { onApproveSuggestion(it) },
            onReject    = { onRejectSuggestion(it) },
            onDismiss   = { showSuggestionsSheet = false }
        )
    }
}

// ─── Top Header ──────────────────────────────────────────────────
@Composable
private fun TopHeader(cs: ColorScheme) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .padding(top = 20.dp, bottom = 4.dp),
        verticalAlignment    = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text("Xin chào 👋", fontSize = 13.sp, color = cs.onSurfaceVariant)
            Text(
                "Bức tranh Tài chính",
                fontSize   = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                color      = cs.onBackground
            )
        }
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(CircleShape)
                .background(cs.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Rounded.Notifications,
                contentDescription = null,
                tint     = cs.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// ─── Balance Hero Card ───────────────────────────────────────────
@Composable
private fun BalanceHeroCard(
    balance      : Double,
    income       : Double,
    expense      : Double,
    show         : Boolean,
    onToggle     : () -> Unit,
    trendPercent : Double,
    trendUp      : Boolean,
    isDark       : Boolean
) {
    // Hero card selalu dark/navy — seperti kartu kredit premium
    val gradStart = if (isDark) Color(0xFF1E3A8A) else Color(0xFF1D4ED8)
    val gradMid   = if (isDark) Color(0xFF1E40AF) else Color(0xFF1E40AF)
    val gradEnd   = if (isDark) Color(0xFF0F172A) else Color(0xFF1E3A8A)

    val incomeColor = Color(0xFF34D399)
    val expenseColor = Color(0xFFF87171)
    val trendColor = if (trendUp) expenseColor else incomeColor
    val trendBg    = if (trendUp) Color(0xFFDC2626).copy(alpha = 0.2f) else Color(0xFF059669).copy(alpha = 0.2f)

    Box(modifier = Modifier.padding(horizontal = 20.dp).padding(top = 16.dp)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(20.dp, RoundedCornerShape(24.dp), ambientColor = gradStart.copy(alpha = 0.3f))
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        listOf(gradStart, gradMid, gradEnd),
                        start = Offset(0f, 0f),
                        end   = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                    )
                )
        ) {
            // Decorative circles
            Box(
                Modifier.size(200.dp).offset(x = (-50).dp, y = (-50).dp)
                    .clip(CircleShape).background(Color.White.copy(alpha = 0.04f))
            )
            Box(
                Modifier.size(130.dp).align(Alignment.TopEnd).offset(x = 35.dp, y = (-25).dp)
                    .clip(CircleShape).background(Color.White.copy(alpha = 0.04f))
            )

            Column(modifier = Modifier.padding(24.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            Modifier.size(8.dp).clip(CircleShape)
                                .background(incomeColor)
                        )
                        Text(
                            "TỔNG SỐ DƯ KHẢ DỤNG",
                            fontSize      = 11.sp,
                            fontWeight    = FontWeight.SemiBold,
                            color         = Color.White.copy(alpha = 0.6f),
                            letterSpacing = 1.2.sp
                        )
                    }
                    IconButton(onClick = onToggle, modifier = Modifier.size(32.dp)) {
                        Icon(
                            if (show) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff,
                            contentDescription = null,
                            tint     = Color.White.copy(alpha = 0.5f),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))
                Text(
                    if (show) formatVND(balance) else "•••••• đ",
                    fontSize   = 34.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color      = Color.White
                )
                Spacer(Modifier.height(6.dp))

                // Trend chip
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(trendBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            "${if (trendUp) "↑" else "↓"} ${"%.1f".format(kotlin.math.abs(trendPercent))}%",
                            color      = trendColor,
                            fontSize   = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        "chi tiêu so với tháng trước",
                        color    = Color.White.copy(alpha = 0.5f),
                        fontSize = 11.sp
                    )
                }

                Spacer(Modifier.height(24.dp))
                Divider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    BalanceStat("Thu nhập",  if (show) formatVND(income)  else "••••••", Icons.Rounded.TrendingUp,   incomeColor)
                    Box(Modifier.width(1.dp).height(40.dp).background(Color.White.copy(alpha = 0.08f)))
                    BalanceStat("Chi tiêu",  if (show) formatVND(expense) else "••••••", Icons.Rounded.TrendingDown, expenseColor)
                }
            }
        }
    }
}

@Composable
private fun BalanceStat(label: String, amount: String, icon: ImageVector, tint: Color) {
    Row(
        verticalAlignment    = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier             = Modifier.width(150.dp)
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(tint.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
        }
        Column {
            Text(label,  fontSize = 11.sp, color = Color.White.copy(alpha = 0.5f))
            Text(amount, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}

// ─── Quick Stat Card ─────────────────────────────────────────────
@Composable
private fun QuickStatCard(
    label    : String,
    value    : String,
    icon     : ImageVector,
    tint     : Color,
    bgTint   : Color,
    cs       : ColorScheme,
    modifier : Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(cs.surface)
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(
                modifier = Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(bgTint),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
            }
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = cs.onSurface)
            Text(label, fontSize = 11.sp, color = cs.onSurfaceVariant)
        }
    }
}

// ─── Transaction Item ─────────────────────────────────────────────
@Composable
private fun TransactionItem(
    tx         : Transaction,
    categories : List<Category>,
    cs         : ColorScheme,
    isDark     : Boolean
) {
    val isIncome      = tx.type == "income"
    val tint          = if (isIncome) cs.secondary else cs.tertiary
    val bgTint        = if (isIncome)
        (if (isDark) EmeraldSurfDark else EmeraldSurface)
    else
        (if (isDark) RoseSurfDark else RoseSurface)
    val icon          = if (isIncome) Icons.Rounded.TrendingUp else Icons.Rounded.TrendingDown
    val prefix        = if (isIncome) "+" else "-"
    val categoryName  = categories.find { it.id == tx.category_id }?.name ?: "Chưa phân loại"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(cs.surface)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(bgTint),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                categoryName,
                fontSize   = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color      = cs.onSurface,
                maxLines   = 1,
                overflow   = TextOverflow.Ellipsis
            )
            Text(
                tx.displayDescription,
                fontSize = 12.sp,
                color    = cs.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                "$prefix${formatVND(tx.amount)}",
                fontSize   = 14.sp,
                fontWeight = FontWeight.Bold,
                color      = tint
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(bgTint)
                    .padding(horizontal = 6.dp, vertical = 1.dp)
            ) {
                Text(
                    if (isIncome) "Thu" else "Chi",
                    fontSize   = 10.sp,
                    color      = tint,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

// ─── Empty State ──────────────────────────────────────────────────
@Composable
private fun EmptyTransactions(cs: ColorScheme) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(cs.surface)
            .padding(vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier.size(60.dp).clip(CircleShape)
                .background(cs.secondaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Rounded.Receipt,
                contentDescription = null,
                tint     = cs.secondary,
                modifier = Modifier.size(28.dp)
            )
        }
        Text("Chưa có giao dịch", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = cs.onSurface)
        Text("Thêm giao dịch đầu tiên của bạn",  fontSize = 13.sp, color = cs.onSurfaceVariant)
    }
}
