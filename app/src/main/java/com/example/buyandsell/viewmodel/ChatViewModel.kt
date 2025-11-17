package com.example.buyandsell.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.buyandsell.data.models.Chat
import com.example.buyandsell.data.models.Message
import com.example.buyandsell.websocket.ChatWebSocket
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ChatViewModel(application: Application) : AndroidViewModel(application) {
    private val webSocket = ChatWebSocket()
    
    private val _chats = MutableStateFlow<List<Chat>>(emptyList())
    val chats: StateFlow<List<Chat>> = _chats.asStateFlow()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    init {
        observeWebSocket()
    }
    
    fun connect(userId: String, token: String) {
        viewModelScope.launch {
            try {
                webSocket.connect(userId, token)
                _isConnected.value = true
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to connect"
                _isConnected.value = false
            }
        }
    }
    
    fun disconnect() {
        viewModelScope.launch {
            webSocket.disconnect()
            _isConnected.value = false
        }
    }
    
    fun sendMessage(chatId: String, receiverId: String, content: String) {
        viewModelScope.launch {
            try {
                webSocket.sendMessage(chatId, receiverId, content)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to send message"
            }
        }
    }
    
    fun loadChats() {
        viewModelScope.launch {
            // TODO: Load chats from API
            _chats.value = emptyList()
        }
    }
    
    fun loadMessages(chatId: String) {
        viewModelScope.launch {
            // TODO: Load messages from API
            _messages.value = emptyList()
        }
    }
    
    private fun observeWebSocket() {
        viewModelScope.launch {
            webSocket.messages.collect { message ->
                _messages.value = _messages.value + message
            }
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        disconnect()
    }
}




