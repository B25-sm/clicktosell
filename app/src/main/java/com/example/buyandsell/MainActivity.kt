package com.example.buyandsell

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.buyandsell.components.BottomNavigationBar
import com.example.buyandsell.navigation.NavGraph
import com.example.buyandsell.navigation.Screen
import com.example.buyandsell.ui.theme.BuyandsellTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BuyandsellTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        // Show bottom bar only on main screens
                        if (currentRoute in listOf(
                                Screen.Home.route,
                                Screen.Search.route,
                                Screen.PostAd.route,
                                Screen.ChatList.route,
                                Screen.Profile.route
                            )
                        ) {
                            BottomNavigationBar(navController = navController, currentRoute = currentRoute)
                        }
                    }
                ) { paddingValues ->
                    NavGraph(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(paddingValues)
                    )
                }
            }
        }
    }
}