package com.expense.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.Budget
import com.expense.app.data.model.Category
import com.expense.app.data.model.User
import com.expense.app.notification.NotificationScheduler
import com.expense.app.ui.theme.*
import com.expense.app.viewmodel.SettingsUiState
import com.expense.app.viewmodel.SettingsViewModel
import java.text.NumberFormat
import java.util.Locale

private enum class SettingsPage { MAIN, PROFILE, PASSWORD, BUDGET }

@Composable
fun SettingsScreen(
    user: User?,
    settingsVm: SettingsViewModel,
    onLogout: () -> Unit
) {
    val state by settingsVm.state.collectAsState()
    var page  by remember { mutableStateOf(SettingsPage.MAIN) }

    LaunchedEffect(Unit) { settingsVm.loadBudgets() }

    state.successMsg?.let { msg ->
        LaunchedEffect(msg) {
            kotlinx.coroutines.delay(2500)
            settingsVm.clearMessage()
        }
    }

    Box(Modifier.fillMaxSize()) {
        when (page) {
            SettingsPage.MAIN     -> MainPage(user, state, onLogout) { page = it }
            SettingsPage.PROFILE  -> ProfilePage(user, state, settingsVm) { page = SettingsPage.MAIN }
            SettingsPage.PASSWORD -> PasswordPage(state, settingsVm) { page = SettingsPage.MAIN }
            SettingsPage.BUDGET   -> BudgetPage(state, settingsVm) { page = SettingsPage.MAIN }
        }

        // Toast messages
        state.successMsg?.let { msg ->
            Box(
                Modifier.align(Alignment.BottomCenter).padding(bottom = 100.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF064E3B))
                    .padding(horizontal = 20.dp, vertical = 10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.CheckCircle, null, tint = Color(0xFF34D399), modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(msg, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
        state.errorMsg?.let { msg ->
            Box(
                Modifier.align(Alignment.BottomCenter).padding(bottom = 100.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF7F1D1D))
                    .padding(horizontal = 20.dp, vertical = 10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.Warning, null, tint = Color(0xFFFCA5A5), modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(msg, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

// ════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════
@Composable
private fun MainPage(
    user: User?,
    state: SettingsUiState,
    onLogout: () -> Unit,
    onNavigate: (SettingsPage) -> Unit
) {
    var showLogoutDialog by remember { mutableStateOf(false) }

    val cs = MaterialTheme.colorScheme
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(cs.background),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        // Hero header
        item {
            Box(
                modifier = Modifier.fillMaxWidth().background(
                    Brush.linearGradient(
                        listOf(GradientDarkStart, GradientGreenMid, GradientGreenStart),
                        start = Offset(0f, 0f), end = Offset(1000f, 500f)
                    )
                )
            ) {
                Box(
                    Modifier.size(160.dp).offset(x = 240.dp, y = (-50).dp)
                        .clip(CircleShape).background(Color.White.copy(alpha = 0.04f))
                )
                Column(
                    modifier = Modifier.fillMaxWidth().padding(24.dp).padding(top = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        Modifier.size(72.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.18f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            (user?.full_name ?: "U").take(1).uppercase(),
                            fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color.White
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(user?.full_name ?: "Người dùng", fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold, color = Color.White)
                    Text(user?.email ?: "", fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.7f), modifier = Modifier.padding(top = 2.dp))
                    Spacer(Modifier.height(12.dp))
                    Box(
                        Modifier.clip(RoundedCornerShape(20.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .padding(horizontal = 14.dp, vertical = 4.dp)
                    ) {
                        Text(
                            if (user?.role == "admin") "Quản trị viên" else "Thành viên",
                            fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Medium
                        )
                    }
                    Spacer(Modifier.height(20.dp))
                }
            }
        }

        // Tài khoản
        item {
            SectionHeader("Tài khoản")
            SettingsCard {
                SettingsRow(Icons.Rounded.Person, cs.secondaryContainer, cs.secondary,
                    "Hồ sơ cá nhân", "Tên, email") { onNavigate(SettingsPage.PROFILE) }
                RowDivider()
                SettingsRow(Icons.Rounded.Lock, cs.primaryContainer, cs.primary,
                    "Bảo mật", "Đổi mật khẩu") { onNavigate(SettingsPage.PASSWORD) }
            }
        }

        // Tài chính
        item {
            SectionHeader("Tài chính")
            SettingsCard {
                SettingsRow(Icons.Rounded.AccountBalanceWallet, cs.tertiaryContainer, Amber,
                    "Ngân sách", "${state.budgets.size} hạn mức") { onNavigate(SettingsPage.BUDGET) }
            }
        }

        // Ứng dụng
        item {
            SectionHeader("Ứng dụng")
            SettingsCard {
                DarkModeToggle()
                RowDivider()
                NotificationToggle()
                RowDivider()
                SmartDetectionToggle()
                RowDivider()
                SettingsRow(Icons.Rounded.Info, cs.primaryContainer, cs.primary,
                    "Về ứng dụng", "Phiên bản 1.0.0", showChevron = false) {}
            }
        }

        // Logout
        item {
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = { showLogoutDialog = true },
                modifier = Modifier.fillMaxWidth().height(50.dp).padding(horizontal = 20.dp),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, DangerRose.copy(alpha = 0.6f)),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = DangerRose)
            ) {
                Icon(Icons.Rounded.Logout, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Đăng xuất", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            icon = { Icon(Icons.Rounded.Logout, null, tint = cs.tertiary) },
            title = { Text("Đăng xuất?", fontWeight = FontWeight.Bold, color = cs.onSurface) },
            text = { Text("Bạn có chắc muốn đăng xuất?", textAlign = TextAlign.Center, color = cs.onSurfaceVariant) },
            confirmButton = {
                Button(onClick = { showLogoutDialog = false; onLogout() },
                    colors = ButtonDefaults.buttonColors(containerColor = cs.tertiary)
                ) { Text("Đăng xuất", fontWeight = FontWeight.Bold) }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) { Text("Hủy") }
            },
            containerColor = cs.surface,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

// ════════════════════════════════════
//  PROFILE PAGE
// ════════════════════════════════════
@Composable
private fun ProfilePage(user: User?, state: SettingsUiState, settingsVm: SettingsViewModel, onBack: () -> Unit) {
    var name  by remember { mutableStateOf(user?.full_name ?: "") }
    var email by remember { mutableStateOf(user?.email ?: "") }

    val cs = MaterialTheme.colorScheme
    LazyColumn(Modifier.fillMaxSize().background(cs.background),
        contentPadding = PaddingValues(bottom = 100.dp)) {
        item { SubHeader("Hồ sơ cá nhân", onBack) }
        item {
            Column(Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(72.dp).clip(CircleShape)
                    .background(Brush.linearGradient(listOf(cs.primary, cs.secondary), Offset(0f,0f), Offset(144f,144f))),
                    contentAlignment = Alignment.Center) {
                    Text((user?.full_name ?: "U").take(1).uppercase(),
                        fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                }
                Spacer(Modifier.height(8.dp))
                Text(user?.full_name ?: "", fontWeight = FontWeight.SemiBold, fontSize = 15.sp, color = cs.onBackground)
            }
        }
        item {
            Card(shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = cs.surface),
                elevation = CardDefaults.cardElevation(1.dp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(value = name, onValueChange = { name = it },
                        label = { Text("Họ và tên") },
                        leadingIcon = { Icon(Icons.Rounded.Person, null, tint = cs.onSurfaceVariant) },
                        singleLine = true, shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = cs.secondary, cursorColor = cs.secondary))
                    OutlinedTextField(value = email, onValueChange = { email = it },
                        label = { Text("Email") },
                        leadingIcon = { Icon(Icons.Rounded.Email, null, tint = cs.onSurfaceVariant) },
                        singleLine = true, shape = RoundedCornerShape(12.dp),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = cs.secondary, cursorColor = cs.secondary))
                    Button(onClick = { settingsVm.updateProfile(name, email) },
                        enabled = !state.isLoading,
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = cs.secondary)) {
                        if (state.isLoading)
                            CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
                        else {
                            Icon(Icons.Rounded.Save, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Lưu thông tin", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
    }
}

// ════════════════════════════════════
//  PASSWORD PAGE
// ════════════════════════════════════
@Composable
private fun PasswordPage(state: SettingsUiState, settingsVm: SettingsViewModel, onBack: () -> Unit) {
    var current  by remember { mutableStateOf("") }
    var newPass  by remember { mutableStateOf("") }
    var confirm  by remember { mutableStateOf("") }
    var showCur  by remember { mutableStateOf(false) }
    var showNew  by remember { mutableStateOf(false) }
    var localErr by remember { mutableStateOf("") }

    val cs = MaterialTheme.colorScheme
    LazyColumn(Modifier.fillMaxSize().background(cs.background),
        contentPadding = PaddingValues(bottom = 100.dp)) {
        item { SubHeader("Bảo mật & Mật khẩu", onBack) }
        item {
            Column(Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(64.dp).clip(RoundedCornerShape(20.dp)).background(cs.primaryContainer),
                    contentAlignment = Alignment.Center) {
                    Icon(Icons.Rounded.Lock, null, tint = cs.primary, modifier = Modifier.size(32.dp))
                }
                Spacer(Modifier.height(8.dp))
                Text("Đổi mật khẩu", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = cs.onBackground)
                Text("Tối thiểu 6 ký tự", fontSize = 12.sp, color = cs.onSurfaceVariant)
            }
        }
        item {
            Card(shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = cs.surface),
                elevation = CardDefaults.cardElevation(1.dp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (localErr.isNotBlank()) {
                        Row(Modifier.clip(RoundedCornerShape(10.dp)).background(cs.tertiaryContainer).padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.Warning, null, tint = cs.tertiary, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text(localErr, color = cs.tertiary, fontSize = 12.sp)
                        }
                    }
                    PassField("Mật khẩu hiện tại", current, showCur, { current = it }) { showCur = !showCur }
                    PassField("Mật khẩu mới", newPass, showNew, { newPass = it }) { showNew = !showNew }
                    PassField("Xác nhận mật khẩu", confirm, false, { confirm = it }) {}
                    Button(
                        onClick = {
                            localErr = ""
                            when {
                                current.isBlank() || newPass.isBlank() || confirm.isBlank() ->
                                    localErr = "Vui lòng nhập đầy đủ"
                                newPass != confirm -> localErr = "Mật khẩu không khớp"
                                newPass.length < 6 -> localErr = "Tối thiểu 6 ký tự"
                                else -> settingsVm.changePassword(current, newPass)
                            }
                        },
                        enabled = !state.isLoading,
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = cs.primary)
                    ) {
                        if (state.isLoading)
                            CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
                        else {
                            Icon(Icons.Rounded.Lock, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Đổi mật khẩu", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PassField(label: String, value: String, show: Boolean, onChange: (String) -> Unit, toggle: () -> Unit) {
    val cs = MaterialTheme.colorScheme
    OutlinedTextField(
        value = value, onValueChange = onChange,
        label = { Text(label) },
        leadingIcon = { Icon(Icons.Rounded.Lock, null, tint = cs.onSurfaceVariant) },
        trailingIcon = {
            IconButton(onClick = toggle) {
                Icon(if (show) Icons.Rounded.VisibilityOff else Icons.Rounded.Visibility, null, tint = cs.onSurfaceVariant)
            }
        },
        visualTransformation = if (show) VisualTransformation.None else PasswordVisualTransformation(),
        singleLine = true, shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth(),
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = cs.primary, cursorColor = cs.primary)
    )
}

// ════════════════════════════════════
//  BUDGET PAGE
// ════════════════════════════════════
@Composable
private fun BudgetPage(state: SettingsUiState, settingsVm: SettingsViewModel, onBack: () -> Unit) {
    var showAdd by remember { mutableStateOf(false) }
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))

    val cs = MaterialTheme.colorScheme
    LazyColumn(Modifier.fillMaxSize().background(cs.background),
        contentPadding = PaddingValues(bottom = 100.dp)) {
        item {
            SubHeader("Kiểm soát chi tiêu", onBack, trailingContent = {
                Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp))
                    .background(Color.White.copy(alpha = 0.15f))
                    .clickable { showAdd = true },
                    contentAlignment = Alignment.Center) {
                    Icon(Icons.Rounded.Add, null, tint = Color.White, modifier = Modifier.size(20.dp))
                }
            })
        }
        if (state.isLoading) {
            item {
                Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.secondary, strokeWidth = 3.dp)
                }
            }
        } else if (state.budgets.isEmpty()) {
            item {
                Column(Modifier.fillMaxWidth().padding(40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("💰", fontSize = 40.sp)
                    Spacer(Modifier.height(12.dp))
                    Text("Chưa có hạn mức nào", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { showAdd = true }, shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)) {
                        Icon(Icons.Rounded.Add, null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Thêm hạn mức", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    state.budgets.forEach { budget ->
                        val bcs = MaterialTheme.colorScheme
                        Card(shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = bcs.surface),
                            elevation = CardDefaults.cardElevation(1.dp)) {
                            Row(Modifier.fillMaxWidth().padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(42.dp).clip(RoundedCornerShape(12.dp))
                                    .background(bcs.secondaryContainer),
                                    contentAlignment = Alignment.Center) { Text("💳", fontSize = 18.sp) }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(budget.category_name ?: "Danh mục",
                                        fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = bcs.onSurface)
                                    Text(if (budget.period == "monthly") "Hàng tháng" else "Hàng năm",
                                        fontSize = 11.sp, color = bcs.onSurfaceVariant)
                                }
                                Text("${fmt.format(budget.amount)} đ",
                                    fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = bcs.secondary)
                                Spacer(Modifier.width(4.dp))
                                IconButton(onClick = { settingsVm.deleteBudget(budget.id ?: "") },
                                    modifier = Modifier.size(32.dp)) {
                                    Icon(Icons.Rounded.Delete, null, tint = bcs.tertiary, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAdd) {
        AddBudgetSheet(
            categories = state.categories,
            onDismiss = { showAdd = false },
            onSave = { catId, amt, period ->
                settingsVm.createBudget(catId, amt, period)
                showAdd = false
            }
        )
    }
}

// ════════════════════════════════════
//  SHARED COMPONENTS
// ════════════════════════════════════

@Composable
private fun SectionHeader(title: String) {
    val cs = MaterialTheme.colorScheme
    Text(title.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Bold,
        color = cs.outline, letterSpacing = 1.sp,
        modifier = Modifier.padding(start = 32.dp, top = 16.dp, bottom = 4.dp))
}

@Composable
private fun SettingsCard(content: @Composable ColumnScope.() -> Unit) {
    val cs = MaterialTheme.colorScheme
    Card(shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cs.surface),
        elevation = CardDefaults.cardElevation(1.dp),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 2.dp)) {
        Column { content() }
    }
}

@Composable
private fun SettingsRow(
    icon: ImageVector, iconBg: Color, iconTint: Color,
    label: String, subtitle: String? = null,
    showChevron: Boolean = true,
    onClick: () -> Unit
) {
    val cs = MaterialTheme.colorScheme
    Row(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)
        .padding(horizontal = 16.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(iconBg),
            contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = iconTint, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(label, fontWeight = FontWeight.Medium, fontSize = 14.sp, color = cs.onSurface)
            subtitle?.let { Text(it, fontSize = 11.sp, color = cs.onSurfaceVariant) }
        }
        if (showChevron)
            Icon(Icons.Rounded.ChevronRight, null, tint = cs.onSurfaceVariant, modifier = Modifier.size(18.dp))
    }
}

@Composable
private fun RowDivider() {
    val cs = MaterialTheme.colorScheme
    Divider(color = cs.outline.copy(alpha = 0.2f), thickness = 0.5.dp, modifier = Modifier.padding(start = 64.dp))
}

@Composable
private fun DarkModeToggle() {
    val isDark   = LocalDarkTheme.current
    val toggle   = LocalToggleDarkTheme.current
    val cs       = MaterialTheme.colorScheme
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier.size(36.dp).clip(RoundedCornerShape(10.dp))
                .background(if (isDark) Color(0xFF1E3A8A) else Color(0xFFEFF6FF)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                if (isDark) Icons.Rounded.DarkMode else Icons.Rounded.LightMode,
                contentDescription = null,
                tint = if (isDark) Color(0xFF60A5FA) else Color(0xFF1D4ED8),
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Giao diện tối", fontWeight = FontWeight.Medium, fontSize = 14.sp, color = cs.onSurface)
            Text(if (isDark) "Đang bật" else "Đang tắt", fontSize = 11.sp, color = cs.onSurfaceVariant)
        }
        Switch(
            checked = isDark,
            onCheckedChange = { toggle() },
            colors = SwitchDefaults.colors(
                checkedThumbColor  = Color.White,
                checkedTrackColor  = Color(0xFF1D4ED8),
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = cs.outline
            )
        )
    }
}

@Composable
private fun NotificationToggle() {
    val cs      = MaterialTheme.colorScheme
    val context = LocalContext.current
    var enabled by remember { mutableStateOf(true) }
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF7C3AED).copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center) {
            Icon(Icons.Rounded.Notifications, null, tint = Color(0xFF7C3AED), modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Thông báo nhắc nhở", fontWeight = FontWeight.Medium, fontSize = 14.sp, color = cs.onSurface)
            Text(if (enabled) "8:00 sáng & 21:00 tối" else "Đã tắt", fontSize = 11.sp, color = cs.onSurfaceVariant)
        }
        Switch(
            checked = enabled,
            onCheckedChange = { on ->
                enabled = on
                if (on) NotificationScheduler.scheduleAll(context)
                else NotificationScheduler.cancelAll(context)
            },
            colors = SwitchDefaults.colors(
                checkedThumbColor   = Color.White, checkedTrackColor   = cs.secondary,
                uncheckedThumbColor = Color.White, uncheckedTrackColor = cs.outline.copy(alpha = 0.4f)
            )
        )
    }
}

@Composable
private fun SmartDetectionToggle() {
    val cs = MaterialTheme.colorScheme
    val context = LocalContext.current
    val isActive = com.expense.app.notification.BankNotificationListener.isRunning
    val activeColor = cs.secondary
    val warningColor = Color(0xFFD97706)

    Row(modifier = Modifier
        .fillMaxWidth()
        .clickable {
            try {
                val intent = android.content.Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            } catch (_: Exception) {
                val intent = android.content.Intent(android.provider.Settings.ACTION_SETTINGS)
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }
        .padding(horizontal = 16.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(
            if (isActive) cs.secondaryContainer else warningColor.copy(alpha = 0.15f)
        ),
            contentAlignment = Alignment.Center) {
            Icon(Icons.Rounded.AutoAwesome, null,
                tint = if (isActive) activeColor else warningColor,
                modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text("Nhận diện giao dịch", fontWeight = FontWeight.Medium, fontSize = 14.sp, color = cs.onSurface)
            Text(
                if (isActive) "Đang hoạt động — 8 ngân hàng"
                else "Chạm để cấp quyền Notification Access",
                fontSize = 11.sp,
                color = if (isActive) activeColor else warningColor
            )
        }
        Box(
            Modifier
                .size(8.dp)
                .clip(androidx.compose.foundation.shape.CircleShape)
                .background(if (isActive) activeColor else warningColor)
        )
    }
}

@Composable
private fun SubHeader(
    title: String,
    onBack: () -> Unit,
    trailingContent: (@Composable () -> Unit)? = null
) {
    val cs = MaterialTheme.colorScheme
    Box(modifier = Modifier.fillMaxWidth().background(
        Brush.linearGradient(listOf(Color(0xFF1D4ED8), Color(0xFF059669)),
            Offset(0f, 0f), Offset(800f, 200f))
    ).padding(horizontal = 16.dp, vertical = 14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Rounded.ArrowBack, null, tint = Color.White)
            }
            Spacer(Modifier.width(4.dp))
            Text(title, fontSize = 17.sp, fontWeight = FontWeight.Bold,
                color = Color.White, modifier = Modifier.weight(1f))
            trailingContent?.invoke()
        }
    }
}
