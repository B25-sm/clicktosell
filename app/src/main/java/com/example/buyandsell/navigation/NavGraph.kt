@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.buyandsell.navigation

import androidx.compose.animation.AnimatedContentScope
import androidx.compose.foundation.layout.Box
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.buyandsell.screens.*

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Search : Screen("search")
    object PostAd : Screen("post_ad")
    object ListingDetails : Screen("listing_details/{listingId}") {
        fun createRoute(listingId: String) = "listing_details/$listingId"
    }
    object MyListings : Screen("my_listings")
    object Favorites : Screen("favorites")
    object Profile : Screen("profile")
    object Settings : Screen("settings")
    object ChatList : Screen("chat_list")
    object Chat : Screen("chat/{chatId}") {
        fun createRoute(chatId: String) = "chat/$chatId"
    }
    object Login : Screen("login")
    object Register : Screen("register")
    object OTPVerification : Screen("otp_verification")
    object ForgotPassword : Screen("forgot_password")
    object Transactions : Screen("transactions")
}

@Composable
internal fun NavGraph(
    navController: NavHostController,
    startDestination: String,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier) {
        NavHost(
            navController = navController,
            startDestination = startDestination
        ) {
        composable(Screen.Home.route) {
            HomeScreen(navController = navController)
        }
        composable(Screen.Search.route) {
            SearchScreen(navController = navController)
        }
        composable(Screen.PostAd.route) {
            PostAdScreen(navController = navController)
        }
        composable(Screen.ListingDetails.route) { backStackEntry ->
            val listingId = backStackEntry.arguments?.getString("listingId") ?: ""
            ListingDetailsScreen(
                navController = navController,
                listingId = listingId
            )
        }
        composable(Screen.MyListings.route) {
            MyListingsScreen(navController = navController)
        }
        composable(Screen.Favorites.route) {
            FavoritesScreen(navController = navController)
        }
        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
        composable(Screen.ChatList.route) {
            ChatListScreen(navController = navController)
        }
        composable(Screen.Chat.route) { backStackEntry ->
            val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
            ChatScreen(
                navController = navController,
                chatId = chatId
            )
        }
        composable(Screen.Login.route) {
            LoginScreen(navController = navController)
        }
        composable(Screen.Register.route) {
            RegisterScreen(navController = navController)
        }
        composable(Screen.OTPVerification.route) {
            OTPVerificationScreen(navController = navController)
        }
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(navController = navController)
        }
        composable(Screen.Transactions.route) {
            TransactionsScreen(navController = navController)
        }
        }
    }
}

private fun AnimatedContentScope.ForgotPasswordScreen(navController: NavHostController) {}

@Composable
fun OTPVerificationScreen(navController: NavHostController) {
    TODO("Not yet implemented")
}

private fun AnimatedContentScope.RegisterScreen(navController: NavHostController) {}

private fun AnimatedContentScope.LoginScreen(navController: NavHostController) {}

