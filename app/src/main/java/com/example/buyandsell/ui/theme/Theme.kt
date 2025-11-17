package com.example.buyandsell.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.example.buyandsell.ui.theme.AccentGold
import com.example.buyandsell.ui.theme.DarkPrimary
import com.example.buyandsell.ui.theme.DarkSurface
import com.example.buyandsell.ui.theme.DarkOnSurface
import com.example.buyandsell.ui.theme.PrimaryBlue
import com.example.buyandsell.ui.theme.SecondaryWhite
import com.example.buyandsell.ui.theme.LightGray
import com.example.buyandsell.ui.theme.LightOnSurface

private val DarkColorScheme = darkColorScheme(
    primary = AccentGold,
    secondary = DarkPrimary,
    tertiary = PrimaryBlue,
    background = DarkSurface,
    surface = DarkSurface,
    onPrimary = DarkPrimary,
    onSecondary = SecondaryWhite,
    onTertiary = SecondaryWhite,
    onBackground = DarkOnSurface,
    onSurface = DarkOnSurface
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    secondary = AccentGold,
    tertiary = LightGray,
    background = SecondaryWhite,
    surface = SecondaryWhite,
    onPrimary = SecondaryWhite,
    onSecondary = PrimaryBlue,
    onTertiary = PrimaryBlue,
    onBackground = LightOnSurface,
    onSurface = LightOnSurface
)

@Composable
fun BuyandsellTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}