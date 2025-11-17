package com.example.buyandsell.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.buyandsell.data.models.Listing as ModelListing
import com.example.buyandsell.navigation.Screen
import com.example.buyandsell.ui.theme.PrimaryBlue
import com.example.buyandsell.viewmodel.ListingsViewModel

// Local Listing type for display (matches HomeScreen's Listing)
data class FavoritesScreen(
    val id: String,
    val title: String,
    val price: String,
    val location: String,
    val imageUrl: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FavoritesScreen(navController: NavController) {
    val viewModel: ListingsViewModel = viewModel()
    val favorites = remember { mutableStateOf<List<ModelListing>>(emptyList()) }
    val isLoading = remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        isLoading.value = true
        try {
            // For now, using empty list. In a real app, use API to get favorites
            // val token = preferencesManager.authToken.value ?: ""
            // if (token.isNotEmpty()) {
            //     val response = apiService.getFavorites(token)
            //     if (response.isSuccessful) {
            //         favorites.value = response.body()?.data?.listings ?: emptyList()
            //     }
            // }
            favorites.value = emptyList()
        } catch (e: Exception) {
            // Handle error
        } finally {
            isLoading.value = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Favorites") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryBlue,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        if (isLoading.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (favorites.value.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(
                        Icons.Default.FavoriteBorder,
                        contentDescription = "No Favorites",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                    Text(
                        text = "No Favorites Yet",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = "Save listings you like",
                        style = MaterialTheme.typography.bodyMedium
                    )
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
                items(favorites.value) { listing ->
                    // Convert model Listing to display format for ListingCard
                    val displayListing = FavoritesScreen(
                        id = listing.id,
                        title = listing.title,
                        price = "₹${listing.price}",
                        location = "${listing.city}${if (listing.state != null) ", ${listing.state}" else ""}",
                        imageUrl = listing.images.firstOrNull()
                    )
                    ListingCard(
                        listing = displayListing,
                        onClick = { navController.navigate(Screen.ListingDetails.createRoute(listing.id)) }
                    )
                }
            }
        }
    }
}


