package com.example.buyandsell.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.buyandsell.screens.auth.LoginScreen
import com.example.buyandsell.ui.theme.BuyandsellTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoginScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun loginScreen_displaysTitle() {
        composeTestRule.setContent {
            BuyandsellTheme {
                LoginScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        composeTestRule.onNodeWithText("Welcome Back").assertIsDisplayed()
    }
    
    @Test
    fun loginScreen_hasEmailField() {
        composeTestRule.setContent {
            BuyandsellTheme {
                LoginScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        composeTestRule.onNodeWithText("Email or Phone").assertIsDisplayed()
    }
    
    @Test
    fun loginScreen_canEnterEmail() {
        composeTestRule.setContent {
            BuyandsellTheme {
                LoginScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        composeTestRule.onNodeWithText("Email or Phone")
            .performTextInput("test@example.com")
    }
}




