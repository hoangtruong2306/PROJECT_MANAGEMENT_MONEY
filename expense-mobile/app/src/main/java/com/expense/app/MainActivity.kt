package com.expense.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.expense.app.notification.NotificationHelper
import com.expense.app.notification.NotificationScheduler
import com.expense.app.ui.navigation.MainNavigation
import com.expense.app.ui.screens.SplashScreen
import com.expense.app.ui.theme.ExpenseAppTheme
import com.expense.app.viewmodel.AuthViewModel
import com.expense.app.viewmodel.ChatViewModel
import com.expense.app.viewmodel.DashboardViewModel
import com.expense.app.viewmodel.SettingsViewModel

class MainActivity : ComponentActivity() {

    private val notifPermLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) NotificationScheduler.scheduleAll(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        NotificationHelper.createChannels(this)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this, Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                NotificationScheduler.scheduleAll(this)
            } else {
                notifPermLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        } else {
            NotificationScheduler.scheduleAll(this)
        }

        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)

        setContent {
            var isDarkMode by remember {
                mutableStateOf(prefs.getBoolean("dark_mode", false))
            }

            ExpenseAppTheme(
                darkTheme = isDarkMode,
                onToggleDarkTheme = {
                    isDarkMode = !isDarkMode
                    prefs.edit().putBoolean("dark_mode", isDarkMode).apply()
                }
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var showSplash by remember { mutableStateOf(true) }

                    if (showSplash) {
                        SplashScreen(onFinished = { showSplash = false })
                    } else {
                        val authVm: AuthViewModel      = viewModel()
                        val dashVm: DashboardViewModel  = viewModel()
                        val settingsVm: SettingsViewModel = viewModel()
                        val chatVm: ChatViewModel      = viewModel()
                        MainNavigation(
                            authVm     = authVm,
                            dashVm     = dashVm,
                            settingsVm = settingsVm,
                            chatVm     = chatVm
                        )
                    }
                }
            }
        }
    }
}
