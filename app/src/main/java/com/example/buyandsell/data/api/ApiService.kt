package com.example.buyandsell.data.api

import com.example.buyandsell.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("api/v1/auth/verify-otp")
    suspend fun verifyOTP(@Body request: OTPRequest): Response<AuthResponse>
    
    @POST("api/v1/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse<Unit>>
    
    @POST("api/v1/auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse<Unit>>
    
    @GET("api/v1/auth/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<ApiResponse<User>>
    
    // Listings
    @GET("api/v1/listings")
    suspend fun getListings(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("category") category: String? = null,
        @Query("city") city: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null,
        @Query("search") search: String? = null
    ): Response<ListingResponse>
    
    @GET("api/v1/listings/{id}")
    suspend fun getListing(@Path("id") id: String): Response<ApiResponse<Listing>>
    
    @POST("api/v1/listings")
    suspend fun createListing(
        @Header("Authorization") token: String,
        @Body listing: CreateListingRequest
    ): Response<ApiResponse<Listing>>
    
    @PUT("api/v1/listings/{id}")
    suspend fun updateListing(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body listing: UpdateListingRequest
    ): Response<ApiResponse<Listing>>
    
    @DELETE("api/v1/listings/{id}")
    suspend fun deleteListing(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ApiResponse<Unit>>
    
    @GET("api/v1/listings/my-listings")
    suspend fun getMyListings(
        @Header("Authorization") token: String
    ): Response<ListingResponse>
    
    // Categories
    @GET("api/v1/categories")
    suspend fun getCategories(): Response<ApiResponse<List<Category>>>
    
    // Search
    @GET("api/v1/search")
    suspend fun search(
        @Query("q") query: String,
        @Query("category") category: String? = null,
        @Query("city") city: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null
    ): Response<ListingResponse>
    
    // Favorites
    @POST("api/v1/favorites/{listingId}")
    suspend fun addFavorite(
        @Header("Authorization") token: String,
        @Path("listingId") listingId: String
    ): Response<ApiResponse<Unit>>
    
    @DELETE("api/v1/favorites/{listingId}")
    suspend fun removeFavorite(
        @Header("Authorization") token: String,
        @Path("listingId") listingId: String
    ): Response<ApiResponse<Unit>>
    
    @GET("api/v1/favorites")
    suspend fun getFavorites(
        @Header("Authorization") token: String
    ): Response<ListingResponse>
}

// Request models
data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val password: String,
    val city: String
)

data class LoginRequest(
    val identifier: String, // email or phone
    val password: String
)

data class OTPRequest(
    val phone: String,
    val otp: String
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val token: String,
    val password: String
)

data class CreateListingRequest(
    val title: String,
    val description: String,
    val price: Double,
    val category: String,
    val subcategory: String? = null,
    val condition: String,
    val location: String,
    val city: String,
    val state: String? = null,
    val images: List<String> = emptyList()
)

data class UpdateListingRequest(
    val title: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val category: String? = null,
    val subcategory: String? = null,
    val condition: String? = null,
    val location: String? = null,
    val city: String? = null,
    val state: String? = null,
    val status: String? = null,
    val images: List<String>? = null
)

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?
)




