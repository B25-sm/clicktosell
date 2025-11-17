package com.example.buyandsell.data.models

data class Listing(
    val id: String,
    val title: String,
    val description: String,
    val price: Double,
    val category: String,
    val subcategory: String? = null,
    val condition: String, // new, used, refurbished
    val location: String,
    val city: String,
    val state: String? = null,
    val images: List<String> = emptyList(),
    val sellerId: String,
    val sellerName: String? = null,
    val sellerPhone: String? = null,
    val status: String = "active", // active, sold, expired, pending
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val views: Int = 0,
    val favorites: Int = 0
)

data class Category(
    val id: String,
    val name: String,
    val icon: String,
    val subcategories: List<String> = emptyList()
)

data class ListingResponse(
    val success: Boolean,
    val data: ListingData?,
    val message: String?
)

data class ListingData(
    val listings: List<Listing>,
    val total: Int,
    val page: Int = 1,
    val limit: Int = 20
)




