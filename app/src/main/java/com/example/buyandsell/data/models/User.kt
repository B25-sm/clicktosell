package com.example.buyandsell.data.models

data class User(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val city: String? = null,
    val profileImage: String? = null,
    val isVerified: Boolean = false,
    val rating: Double = 0.0,
    val totalRatings: Int = 0
)

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val message: String?
)

data class AuthData(
    val user: User,
    val token: String,
    val refreshToken: String?
)




