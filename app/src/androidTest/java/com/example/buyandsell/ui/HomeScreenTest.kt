package com.example.buyandsell.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.buyandsell.screens.HomeScreen
import com.example.buyandsell.ui.theme.BuyandsellTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HomeScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun homeScreen_displaysTitle() {
        composeTestRule.setContent {
            BuyandsellTheme {
                HomeScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        composeTestRule.onNodeWithText("Buy & Sell").assertIsDisplayed()
    }
    
    @Test
    fun homeScreen_displaysCategories() {
        composeTestRule.setContent {
            BuyandsellTheme {
                HomeScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        composeTestRule.onNodeWithText("Categories").assertIsDisplayed()
    }
    
    @Test
    fun homeScreen_displaysSearchBar() {
        composeTestRule.setContent {
            BuyandsellTheme {
                HomeScreen(navController = androidx.navigation.compose.rememberNavController())
            }
        }
        
        // Search bar should be visible
        composeTestRule.onNodeWithText("Search for products, brands, and more...")
            .assertIsDisplayed()
    }
}




