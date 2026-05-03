package com.expense.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

val LocalDarkTheme        = compositionLocalOf { false }
val LocalToggleDarkTheme  = compositionLocalOf<() -> Unit> { {} }

private val LightColors = lightColorScheme(
    primary             = NavyBlue,
    onPrimary           = Color.White,
    primaryContainer    = NavySurface,
    onPrimaryContainer  = NavyBlue,
    secondary           = Emerald,
    onSecondary         = Color.White,
    secondaryContainer  = EmeraldSurface,
    onSecondaryContainer = Color(0xFF064E3B),
    tertiary            = Rose,
    onTertiary          = Color.White,
    tertiaryContainer   = RoseSurface,
    onTertiaryContainer = Color(0xFF7F1D1D),
    error               = Rose,
    onError             = Color.White,
    background          = Bg100Light,
    onBackground        = TxtPrimaryL,
    surface             = Sur100Light,
    onSurface           = TxtPrimaryL,
    surfaceVariant      = Bg200Light,
    onSurfaceVariant    = TxtSecondaryL,
    outline             = BorderL,
    outlineVariant      = Color(0xFFF1F5F9),
)

private val DarkColors = darkColorScheme(
    primary             = NavyBlueDark,
    onPrimary           = Color(0xFF0F172A),
    primaryContainer    = NavySurfaceDark,
    onPrimaryContainer  = Color(0xFFBFDBFE),
    secondary           = EmeraldLight,
    onSecondary         = Color(0xFF064E3B),
    secondaryContainer  = EmeraldSurfDark,
    onSecondaryContainer = EmeraldLight,
    tertiary            = RoseLight,
    onTertiary          = Color(0xFF7F1D1D),
    tertiaryContainer   = RoseSurfDark,
    onTertiaryContainer = RoseLight,
    error               = RoseLight,
    onError             = Color(0xFF7F1D1D),
    background          = Bg100Dark,
    onBackground        = TxtPrimaryD,
    surface             = Bg200Dark,
    onSurface           = TxtPrimaryD,
    surfaceVariant      = Sur100Dark,
    onSurfaceVariant    = TxtSecondaryD,
    outline             = BorderD,
    outlineVariant      = Color(0xFF4B5563),
)

@Composable
fun ExpenseAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    onToggleDarkTheme: () -> Unit = {},
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val activity = view.context as? Activity
            if (activity != null) {
                activity.window.statusBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(activity.window, view)
                    .isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    CompositionLocalProvider(
        LocalDarkTheme       provides darkTheme,
        LocalToggleDarkTheme provides onToggleDarkTheme,
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography  = AppTypography,
            shapes      = AppShapes,
            content     = content
        )
    }
}
