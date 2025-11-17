package com.example.buyandsell.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import com.example.buyandsell.navigation.Screen

@Composable
fun BottomNavigationBar(navController: NavController, currentRoute: String?) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        modifier = Modifier
    ) {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = currentRoute == Screen.Home.route,
            onClick = { navController.navigate(Screen.Home.route) { popUpTo(Screen.Home.route) } }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
            label = { Text("Search") },
            selected = currentRoute == Screen.Search.route,
            onClick = { navController.navigate(Screen.Search.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.AddCircle, contentDescription = "Post Ad") },
            label = { Text("Post") },
            selected = currentRoute == Screen.PostAd.route,
            onClick = { navController.navigate(Screen.PostAd.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Email, contentDescription = "Messages") },
            label = { Text("Messages") },
            selected = currentRoute == Screen.ChatList.route,
            onClick = { navController.navigate(Screen.ChatList.route) }
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
            label = { Text("Profile") },
            selected = currentRoute == Screen.Profile.route,
            onClick = { navController.navigate(Screen.Profile.route) }
        )
    }
}


