package com.example.buyandsell.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.buyandsell.navigation.Screen
import com.example.buyandsell.ui.theme.PrimaryBlue

@Composable
fun MyListingsScreen(navController: NavController) {
    val myListings = remember { emptyList<HomeScreen.Listing>() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Listings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.PostAd.route) }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Listing")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryBlue,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { navController.navigate(Screen.PostAd.route) },
                containerColor = PrimaryBlue
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Listing")
            }
        }
    ) { padding ->
        if (myListings.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Column(
                    horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(
                        Icons.Default.Inventory2,
                        contentDescription = "No Listings",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                    Text(
                        text = "No Listings Yet",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = "Start selling by posting your first ad",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Button(
                        onClick = { navController.navigate(Screen.PostAd.route) },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Post Your First Ad")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(myListings) { listing ->
                    ListingCard(
                        listing = listing,
                        onClick = { navController.navigate(Screen.ListingDetails.createRoute(listing.id)) }
                    )
                }
            }
        }
    }
}




