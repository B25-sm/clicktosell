package com.example.buyandsell.data.models

data class Chat(
    val id: String,
    val listingId: String? = null,
    val listingTitle: String? = null,
    val listingImage: String? = null,
    val otherUserId: String,
    val otherUserName: String,
    val otherUserImage: String? = null,
    val lastMessage: String? = null,
    val lastMessageTime: String? = null,
    val unreadCount: Int = 0,
    val createdAt: String? = null
)

data class Message(
    val id: String,
    val chatId: String,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val type: String = "text", // text, image, location
    val imageUrl: String? = null,
    val isRead: Boolean = false,
    val createdAt: String
)




