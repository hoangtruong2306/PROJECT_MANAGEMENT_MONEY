package com.expense.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Wallet
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Dashboard
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.expense.app.ui.screens.*
import com.expense.app.viewmodel.AuthViewModel
import com.expense.app.viewmodel.ChatViewModel
import com.expense.app.viewmodel.DashboardViewModel
import com.expense.app.viewmodel.SettingsViewModel

sealed class BottomNavItem(val route: String, val label: String, val icon: ImageVector) {
    object Dashboard : BottomNavItem("dashboard", "Tổng quan", Icons.Rounded.Dashboard)
    object Analytics : BottomNavItem("analytics", "Biểu đồ",  Icons.Outlined.BarChart)
    object Finance   : BottomNavItem("finance",   "Dòng tiền", Icons.Outlined.Wallet)
    object Chat      : BottomNavItem("chat",      "Trợ lý AI", Icons.Rounded.AutoAwesome)
    object Settings  : BottomNavItem("settings",  "Cài đặt",   Icons.Outlined.Settings)
}

private val navItems = listOf(
    BottomNavItem.Dashboard,
    BottomNavItem.Analytics,
    BottomNavItem.Finance,
    BottomNavItem.Chat,
    BottomNavItem.Settings
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavigation(
    authVm    : AuthViewModel,
    dashVm    : DashboardViewModel,
    settingsVm: SettingsViewModel,
    chatVm    : ChatViewModel
) {
    val cs        = MaterialTheme.colorScheme
    val authState by authVm.state.collectAsState()
    val dashState by dashVm.state.collectAsState()
    var showAddSheet by remember { mutableStateOf(false) }

    if (!authState.isLoggedIn) {
        var showRegister by remember { mutableStateOf(false) }
        if (showRegister) {
            RegisterScreen(
                state             = authState,
                onRegister        = { name, email, pass -> authVm.register(name, email, pass) },
                onNavigateToLogin = { showRegister = false }
            )
        } else {
            LoginScreen(
                state               = authState,
                onLogin             = { email, pass -> authVm.login(email, pass) },
                onNavigateToRegister = { showRegister = true }
            )
        }
        return
    }

    LaunchedEffect(authState.isLoggedIn) {
        if (authState.isLoggedIn) dashVm.loadDashboard()
    }

    val navController = rememberNavController()
    val currentEntry  by navController.currentBackStackEntryAsState()
    val currentRoute  = currentEntry?.destination?.route ?: "dashboard"

    Scaffold(
        containerColor = cs.background,
        bottomBar = {
            NavigationBar(
                containerColor = cs.surface,
                tonalElevation = 0.dp,
                modifier       = Modifier.clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            ) {
                navItems.forEach { item ->
                    val selected = currentRoute == item.route
                    NavigationBarItem(
                        selected = selected,
                        onClick  = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState    = true
                            }
                        },
                        icon  = { Icon(item.icon, contentDescription = item.label) },
                        label = {
                            Text(
                                text       = item.label,
                                fontSize   = 10.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                color      = if (selected) cs.secondary else cs.onSurfaceVariant
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor   = cs.secondary,
                            selectedTextColor   = cs.secondary,
                            unselectedIconColor = cs.onSurfaceVariant,
                            unselectedTextColor = cs.onSurfaceVariant,
                            indicatorColor      = cs.secondaryContainer
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            if (currentRoute == "dashboard" || currentRoute == "finance") {
                FloatingActionButton(
                    onClick        = { showAddSheet = true },
                    containerColor = cs.secondary,
                    contentColor   = cs.onSecondary,
                    shape          = RoundedCornerShape(16.dp)
                ) {
                    Icon(Icons.Rounded.Add, contentDescription = "Thêm giao dịch")
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController    = navController,
            startDestination = "dashboard",
            modifier         = Modifier.padding(innerPadding)
        ) {
            composable("dashboard") {
                DashboardScreen(
                    state               = dashState,
                    onSyncClick         = { dashVm.triggerSync() },
                    onApproveSuggestion = { dashVm.approveSuggestion(it) },
                    onRejectSuggestion  = { dashVm.rejectSuggestion(it) },
                    onLoadSuggestions   = { dashVm.loadSuggestedTransactions() }
                )
            }
            composable("analytics") { AnalyticsScreen(dashState) }
            composable("finance")   { FinanceScreen(dashState) }
            composable("chat")      { ChatScreen(chatVm) }
            composable("settings")  {
                SettingsScreen(
                    user       = authState.user,
                    settingsVm = settingsVm,
                    onLogout   = { authVm.logout() }
                )
            }
        }

        if (showAddSheet) {
            AddTransactionSheet(
                categories = dashState.categories,
                wallets    = dashState.wallets,
                onDismiss  = { showAddSheet = false },
                onSave     = { type, amount, categoryId, note, walletId ->
                    dashVm.createTransaction(type, amount, categoryId, note, walletId)
                    showAddSheet = false
                }
            )
        }
    }
}
