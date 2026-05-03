package com.expense.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.CategoryStat
import com.expense.app.data.model.MonthlyStat
import com.expense.app.data.model.TrendStat
import com.expense.app.ui.theme.*
import com.expense.app.viewmodel.DashboardUiState
import java.text.NumberFormat
import java.util.Locale

private val chartColors = listOf(
    PrimaryGreen, PrimaryGreenLight, WarningAmber,
    AccentTeal, AccentCyan, PrimaryGreenDark,
    SuccessMint, Color(0xFF0284C7)
)

private val BarGreen = Color(0xFF059669)
private val BarRed = Color(0xFFEF4444)
private val BarGreenLight = Color(0xFF059669).copy(alpha = 0.15f)
private val BarRedLight = Color(0xFFEF4444).copy(alpha = 0.15f)

private fun fmtVND(v: Double): String {
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    return "${fmt.format(v)} đ"
}

private fun fmtCompact(v: Double): String {
    return when {
        v >= 1_000_000 -> "${String.format("%.1f", v / 1_000_000)}tr"
        v >= 1_000 -> "${String.format("%.0f", v / 1_000)}k"
        else -> "${v.toInt()}"
    }
}

@Composable
fun AnalyticsScreen(state: DashboardUiState) {
    val cs = MaterialTheme.colorScheme
    var selectedTab by remember { mutableIntStateOf(0) }

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
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Biểu đồ Phân tích 📊", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = cs.onBackground)
            Text(
                "Phân tích chi tiêu theo danh mục và xu hướng",
                fontSize = 13.sp,
                color = cs.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        // ── Tab Selector
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(cs.surface)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                listOf("Danh mục", "Theo tháng", "Xu hướng").forEachIndexed { index, label ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (selectedTab == index) cs.secondary else Color.Transparent)
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            label,
                            fontSize = 13.sp,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                            color = if (selectedTab == index) Color.White else cs.onSurfaceVariant,
                            modifier = Modifier.noRippleClickable { selectedTab = index }
                        )
                    }
                }
            }
        }

        // ── Content based on selected tab
        when (selectedTab) {
            0 -> {
                // ── Donut Chart (Category)
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = cs.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text("Tỉ lệ chi tiêu theo danh mục", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = cs.onSurface)
                            Spacer(Modifier.height(16.dp))

                            if (state.categoryStats.isEmpty()) {
                                Text(
                                    "Chưa có dữ liệu",
                                    color = cs.onSurfaceVariant,
                                    modifier = Modifier.fillMaxWidth(),
                                    textAlign = TextAlign.Center
                                )
                            } else {
                                DonutChart(
                                    state.categoryStats,
                                    modifier = Modifier
                                        .height(200.dp)
                                        .fillMaxWidth()
                                )
                                Spacer(Modifier.height(16.dp))
                                state.categoryStats.forEachIndexed { i, stat ->
                                    CategoryLegendItem(stat, chartColors[i % chartColors.size])
                                }
                            }
                        }
                    }
                }
            }
            1 -> {
                // ── Monthly Bar Chart (Income vs Expense)
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = cs.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text("Thu nhập vs Chi tiêu", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = cs.onSurface)
                            Text("6 tháng gần nhất", fontSize = 12.sp, color = cs.onSurfaceVariant)
                            Spacer(Modifier.height(8.dp))

                            // Legend
                            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                LegendDot(BarGreen, "Thu nhập")
                                LegendDot(BarRed, "Chi tiêu")
                            }
                            Spacer(Modifier.height(16.dp))

                            if (state.monthlyStats.isEmpty()) {
                                Box(
                                    Modifier
                                        .fillMaxWidth()
                                        .height(200.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("Chưa có dữ liệu", color = cs.onSurfaceVariant)
                                }
                            } else {
                                MonthlyBarChart(
                                    data = state.monthlyStats,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(250.dp)
                                )
                            }
                        }
                    }
                }

                // Monthly stats summary cards
                if (state.monthlyStats.isNotEmpty()) {
                    item {
                        val totalIncome = state.monthlyStats.sumOf { it.income }
                        val totalExpense = state.monthlyStats.sumOf { it.expense }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            SummaryCard(
                                label = "Tổng thu",
                                value = fmtVND(totalIncome),
                                color = BarGreen,
                                modifier = Modifier.weight(1f)
                            )
                            SummaryCard(
                                label = "Tổng chi",
                                value = fmtVND(totalExpense),
                                color = BarRed,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
            2 -> {
                // ── Trend list
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = cs.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text("Xu hướng 6 tháng gần nhất", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = cs.onSurface)
                            Spacer(Modifier.height(12.dp))
                            if (state.trendStats.isEmpty()) {
                                Text("Chưa có dữ liệu", color = cs.onSurfaceVariant)
                            } else {
                                state.trendStats.forEach { t ->
                                    TrendRow(t)
                                    Spacer(Modifier.height(8.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Helper: no-ripple clickable modifier
@Composable
private fun Modifier.noRippleClickable(onClick: () -> Unit): Modifier =
    this
        .clip(RoundedCornerShape(10.dp))
        .clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null,
            onClick = onClick
        )

// ── Legend Dot
@Composable
private fun LegendDot(color: Color, label: String) {
    val cs = MaterialTheme.colorScheme
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(color))
        Text(label, fontSize = 12.sp, color = cs.onSurfaceVariant, fontWeight = FontWeight.Medium)
    }
}

// ── Summary Card
@Composable
private fun SummaryCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    val cs = MaterialTheme.colorScheme
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, color = cs.outline)
            Spacer(Modifier.height(4.dp))
            Text(value, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

// ── Monthly Bar Chart (Grouped: Income vs Expense)
@Composable
private fun MonthlyBarChart(data: List<MonthlyStat>, modifier: Modifier = Modifier) {
    val cs = MaterialTheme.colorScheme
    val maxVal = data.maxOfOrNull { maxOf(it.income, it.expense) } ?: 1.0

    Column(modifier = modifier) {
        // Bars
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val barAreaWidth = size.width
                val barAreaHeight = size.height - 30f // Leave space for labels
                val groupWidth = barAreaWidth / data.size
                val barWidth = groupWidth * 0.3f
                val gap = groupWidth * 0.05f

                // Draw horizontal grid lines (3 lines)
                for (i in 1..3) {
                    val y = barAreaHeight * (1f - i / 4f)
                    drawLine(
                        color = Color(0xFFE2E8F0),
                        start = Offset(0f, y),
                        end = Offset(barAreaWidth, y),
                        strokeWidth = 1f
                    )
                }

                data.forEachIndexed { index, stat ->
                    val groupX = index * groupWidth + groupWidth * 0.15f

                    // Income bar
                    val incomeHeight = (stat.income / maxVal * barAreaHeight).toFloat()
                    drawRoundRect(
                        color = BarGreen,
                        topLeft = Offset(groupX, barAreaHeight - incomeHeight),
                        size = Size(barWidth, incomeHeight),
                        cornerRadius = CornerRadius(6f, 6f)
                    )

                    // Expense bar
                    val expenseHeight = (stat.expense / maxVal * barAreaHeight).toFloat()
                    drawRoundRect(
                        color = BarRed,
                        topLeft = Offset(groupX + barWidth + gap, barAreaHeight - expenseHeight),
                        size = Size(barWidth, expenseHeight),
                        cornerRadius = CornerRadius(6f, 6f)
                    )
                }
            }
        }

        // Month labels
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            data.forEach { stat ->
                val monthLabel = stat.month.takeLast(2).let { "T${it.trimStart('0')}" }
                Text(
                    monthLabel,
                    fontSize = 11.sp,
                    color = cs.onSurfaceVariant,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Value labels on the right side
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            data.forEach { stat ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(fmtCompact(stat.income), fontSize = 9.sp, color = BarGreen, fontWeight = FontWeight.SemiBold)
                    Text(fmtCompact(stat.expense), fontSize = 9.sp, color = BarRed, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// ── Donut Chart
@Composable
private fun DonutChart(categories: List<CategoryStat>, modifier: Modifier = Modifier) {
    val total = categories.sumOf { it.total }

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.size(160.dp)) {
            val strokeWidth = 28f
            var startAngle = -90f
            val rectSize = Size(size.width - strokeWidth, size.height - strokeWidth)
            val topLeftOffset = Offset(strokeWidth / 2, strokeWidth / 2)

            categories.forEachIndexed { i, cs ->
                val rawSweep = if (total > 0) (cs.total / total * 360).toFloat() else 0f
                val sweep = if (rawSweep > 2f) rawSweep - 2f else rawSweep
                
                drawArc(
                    color = chartColors[i % chartColors.size],
                    startAngle = startAngle,
                    sweepAngle = sweep,
                    useCenter = false,
                    topLeft = topLeftOffset,
                    size = rectSize,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
                startAngle += rawSweep
            }
        }

        val mcs = MaterialTheme.colorScheme
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Tổng chi", fontSize = 11.sp, color = mcs.outline)
            Text(fmtVND(total), fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = mcs.onSurface)
        }
    }
}

@Composable
private fun CategoryLegendItem(stat: CategoryStat, color: Color) {
    val cs = MaterialTheme.colorScheme
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    ) {
        Box(Modifier.size(10.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(10.dp))
        Text(stat.category_name ?: "Khác", fontSize = 13.sp, fontWeight = FontWeight.Medium,
            color = cs.onSurface, modifier = Modifier.weight(1f))
        Text(fmtVND(stat.total), fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = cs.onSurfaceVariant)
    }
}

@Composable
private fun TrendRow(t: TrendStat) {
    val cs = MaterialTheme.colorScheme
    val maxVal = maxOf(t.current, t.previous, 1.0)
    val currentProgress  = (t.current  / maxVal).toFloat().coerceIn(0f, 1f)
    val previousProgress = (t.previous / maxVal).toFloat().coerceIn(0f, 1f)

    Card(
        shape  = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp))
                        .background(cs.secondaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.TrendingUp,
                        contentDescription = null,
                        tint     = cs.secondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(Modifier.width(12.dp))
                Text(t.month, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = cs.onSurface)
            }
            Spacer(Modifier.height(14.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Năm nay:", fontSize = 11.sp, color = cs.onSurfaceVariant, modifier = Modifier.width(64.dp))
                LinearProgressIndicator(
                    progress    = currentProgress,
                    modifier    = Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color       = cs.secondary,
                    trackColor  = cs.secondaryContainer
                )
                Spacer(Modifier.width(8.dp))
                Text(fmtVND(t.current), fontSize = 11.sp, color = cs.onSurface, fontWeight = FontWeight.SemiBold)
            }
            Spacer(Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Năm trước:", fontSize = 11.sp, color = cs.outline, modifier = Modifier.width(64.dp))
                LinearProgressIndicator(
                    progress    = previousProgress,
                    modifier    = Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color       = cs.outline,
                    trackColor  = cs.outlineVariant
                )
                Spacer(Modifier.width(8.dp))
                Text(fmtVND(t.previous), fontSize = 11.sp, color = cs.outline)
            }
        }
    }
}
