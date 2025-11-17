package com.example.buyandsell.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.buyandsell.data.api.RetrofitClient
import com.example.buyandsell.data.local.PreferencesManager
import com.example.buyandsell.data.models.Listing
import com.example.buyandsell.data.models.ListingResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ListingsViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = RetrofitClient.apiService
    private val preferencesManager = PreferencesManager(application)

    private val _listings = MutableStateFlow<List<Listing>>(emptyList())
    val listings: StateFlow<List<Listing>> = _listings.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadListings(
        page: Int = 1,
        limit: Int = 20,
        category: String? = null,
        city: String? = null,
        search: String? = null
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = apiService.getListings(page, limit, category, city, null, null, search)
                if (response.isSuccessful) {
                    _listings.value = response.body()?.data?.listings ?: emptyList()
                } else {
                    _error.value = "Failed to load listings"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun searchListings(query: String, category: String? = null, city: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = apiService.search(query, category, city)
                if (response.isSuccessful) {
                    _listings.value = response.body()?.data?.listings ?: emptyList()
                } else {
                    _error.value = "Search failed"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun createListing(listing: com.example.buyandsell.data.models.CreateListingRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val token = preferencesManager.authToken.value ?: ""
                if (token.isEmpty()) {
                    _error.value = "Not authenticated"
                    return@launch
                }
                val authenticatedService = RetrofitClient.getAuthenticatedService(token)
                val response = authenticatedService.createListing(listing)
                if (response.isSuccessful && response.body()?.success == true) {
                    loadListings() // Reload listings
                } else {
                    _error.value = response.body()?.message ?: "Failed to create listing"
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Network error"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun getListingById(id: String, onSuccess: (Listing) -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = apiService.getListing(id)
                if (response.isSuccessful && response.body()?.success == true) {
                    response.body()?.data?.let { onSuccess(it) }
                } else {
                    onError(response.body()?.message ?: "Failed to load listing")
                }
            } catch (e: Exception) {
                onError(e.message ?: "Network error")
            } finally {
                _isLoading.value = false
            }
        }
    }
}




