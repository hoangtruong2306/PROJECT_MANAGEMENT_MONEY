package com.expense.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.CreditCard
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.PieChart
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.Budget
import com.expense.app.data.model.Category
import com.expense.app.data.model.Goal
import com.expense.app.data.model.Transaction
import com.expense.app.data.model.Wallet
import com.expense.app.ui.theme.*
import com.expense.app.viewmodel.DashboardUiState
import androidx.compose.material3.ColorScheme
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

private val walletGradients = listOf(
    listOf(Color(0xFF059669), Color(0xFF064E3B)), // Emerald
    listOf(Color(0xFF0D9488), Color(0xFF134E4A)), // Teal
    listOf(Color(0xFF0891B2), Color(0xFF164E63)), // Cyan
    listOf(Color(0xFF34D399), Color(0xFF047857)), // Emerald L/D
)

private val BudgetAmber = Color(0xFFF59E0B)
private val BudgetRed = Color(0xFFEF4444)
private val BudgetAmberBg = Color(0xFFF59E0B).copy(alpha = 0.12f)
private val BudgetRedBg = Color(0xFFEF4444).copy(alpha = 0.12f)

private fun fmtAmount(v: Double): String {
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    return "${fmt.format(v)} đ"
}

/**
 * Tính tổng chi tiêu trong tháng hiện tại cho một category.
 */
private fun calcSpentThisMonth(
    categoryId: String?,
    transactions: List<Transaction>
): Double {
    if (categoryId == null) return 0.0
    val cal = Calendar.getInstance()
    val currentMonth = SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(cal.time)
    return transactions
        .filter { tx ->
            tx.category_id == categoryId
                    && tx.type == "expense"
                    && tx.transaction_date?.startsWith(currentMonth) == true
        }
        .sumOf { it.amount }
}

@Composable
fun FinanceScreen(state: DashboardUiState) {
    val cs = MaterialTheme.colorScheme
    val isDark = LocalDarkTheme.current

    if (state.isLoading) {
        Box(Modifier.fillMaxSize().background(cs.background), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = cs.secondary)
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(cs.background),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                "Dòng tiền 💳",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = cs.onBackground,
                modifier = Modifier.padding(horizontal = 20.dp)
            )
            Text(
                "Quản lý ví, ngân sách và mục tiêu tài chính",
                fontSize = 13.sp,
                color = cs.onSurfaceVariant,
                modifier = Modifier.padding(start = 20.dp, top = 4.dp)
            )
        }

        // ── Wallet Carousel
        item {
            Text(
                "Ví của bạn",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = cs.onBackground,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
            )
            if (state.wallets.isEmpty()) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cs.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Chưa tạo ví nào 👛", color = cs.onSurfaceVariant)
                    }
                }
            } else {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    itemsIndexed(state.wallets) { index, wallet ->
                        WalletCard(wallet, index)
                    }
                }
            }
        }

        // ── Budget Section (NEW)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Ngân sách tháng này",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = cs.onBackground
                )
                if (state.budgets.isNotEmpty()) {
                    val overBudgetCount = state.budgets.count { budget ->
                        val spent = calcSpentThisMonth(budget.category_id, state.allTransactions)
                        spent >= (budget.amount * 0.8)
                    }
                    if (overBudgetCount > 0) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(BudgetAmberBg)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                "⚠️ $overBudgetCount cảnh báo",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = BudgetAmber
                            )
                        }
                    }
                }
            }
        }

        if (state.budgets.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cs.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Chưa thiết lập ngân sách 📋", color = cs.onSurfaceVariant)
                            Spacer(Modifier.height(4.dp))
                            Text(
                                "Tạo ngân sách để kiểm soát chi tiêu",
                                fontSize = 12.sp,
                                color = cs.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        } else {
            items(state.budgets) { budget ->
                BudgetCard(
                    budget = budget,
                    spent = calcSpentThisMonth(budget.category_id, state.allTransactions),
                    categories = state.categories,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )
            }
        }

        // ── Goals
        item {
            Text(
                "Mục tiêu tiết kiệm",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = cs.onBackground,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
            )
        }

        if (state.goals.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cs.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Chưa có mục tiêu nào 🎯", color = cs.onSurfaceVariant)
                    }
                }
            }
        } else {
            items(state.goals) { goal ->
                GoalCard(goal, modifier = Modifier.padding(horizontal = 20.dp))
            }
        }
    }
}

// ── Budget Card (NEW)
@Composable
private fun BudgetCard(
    budget: Budget,
    spent: Double,
    categories: List<Category>,
    modifier: Modifier = Modifier
) {
    val cs = MaterialTheme.colorScheme
    val isDark = LocalDarkTheme.current
    val limit = budget.amount
    val progress = if (limit > 0) (spent / limit).toFloat().coerceIn(0f, 1.5f) else 0f
    val percent = (progress * 100).toInt()
    val categoryName = categories.find { it.id == budget.category_id }?.name
        ?: budget.category_name
        ?: "Chưa phân loại"

    val (progressColor, bgTint, statusText) = when {
        percent >= 100 -> Triple(cs.tertiary, if (isDark) RoseSurfDark else RoseSurface, "🚨 Vượt hạn mức!")
        percent >= 80  -> Triple(Amber,       if (isDark) AmberSurfDark else AmberSurface, "⚠️ Gần hết")
        else           -> Triple(cs.secondary, if (isDark) EmeraldSurfDark else EmeraldSurface, "✅ An toàn")
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(bgTint),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (percent >= 80) Icons.Rounded.Warning else Icons.Rounded.PieChart,
                        contentDescription = null,
                        tint = progressColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        categoryName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        statusText,
                        fontSize = 11.sp,
                        color = progressColor,
                        fontWeight = FontWeight.Medium
                    )
                }
                Text(
                    "${percent.coerceAtMost(999)}%",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = progressColor
                )
            }
            Spacer(Modifier.height(12.dp))
            LinearProgressIndicator(
                progress = progress.coerceAtMost(1f),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = progressColor,
                trackColor = bgTint
            )
            Spacer(Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Đã chi: ${fmtAmount(spent)}", fontSize = 12.sp, color = cs.onSurfaceVariant)
                Text("Hạn mức: ${fmtAmount(limit)}", fontSize = 12.sp, color = cs.outline)
            }
        }
    }
}

@Composable
private fun WalletCard(wallet: Wallet, index: Int) {
    val gradient = walletGradients[index % walletGradients.size]

    Card(
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier
            .width(260.dp)
            .height(150.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        gradient,
                        start = Offset(0f, 0f),
                        end = Offset.Infinite
                    )
                )
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(androidx.compose.foundation.shape.CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Rounded.CreditCard,
                            contentDescription = null,
                            tint = Color.White
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    Text(
                        wallet.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Column {
                    Text("Số dư", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                    Text(
                        fmtAmount(wallet.balance),
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

@Composable
private fun GoalCard(goal: Goal, modifier: Modifier = Modifier) {
    val cs = MaterialTheme.colorScheme
    val progress = if (goal.target_amount > 0)
        (goal.current_amount / goal.target_amount).toFloat().coerceIn(0f, 1f)
    else 0f
    val percent = (progress * 100).toInt()

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(PrimaryGreenSurface),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Rounded.Flag,
                        contentDescription = null,
                        tint = PrimaryGreen,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(Modifier.width(12.dp))
                Text(
                    goal.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    modifier = Modifier.weight(1f)
                )
                Text("$percent%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
            }
            Spacer(Modifier.height(12.dp))
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = if (percent >= 100) SuccessMint else PrimaryGreen,
                trackColor = PrimaryGreenSurface
            )
            Spacer(Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(fmtAmount(goal.current_amount), fontSize = 12.sp, color = cs.onSurfaceVariant)
                Text("Mục tiêu: ${fmtAmount(goal.target_amount)}", fontSize = 12.sp, color = cs.outline)
            }
        }
    }
}
