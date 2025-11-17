package com.example.buyandsell.websocket

import com.example.buyandsell.config.ApiConfig
import com.example.buyandsell.data.models.Message
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ChatWebSocket {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .pingInterval(30, TimeUnit.SECONDS)
        .build()
    
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()
    
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()
    
    fun connect(userId: String, token: String) {
        val request = Request.Builder()
            .url("${ApiConfig.WS_URL}/socket.io/?EIO=4&transport=websocket&userId=$userId")
            .addHeader("Authorization", "Bearer $token")
            .build()
        
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                _isConnected.value = true
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val message = Message(
                        id = json.optString("id", ""),
                        chatId = json.optString("chatId", ""),
                        senderId = json.optString("senderId", ""),
                        receiverId = json.optString("receiverId", ""),
                        content = json.optString("content", ""),
                        type = json.optString("type", "text"),
                        isRead = json.optBoolean("isRead", false),
                        createdAt = json.optString("createdAt", "")
                    )
                    _messages.value = _messages.value + message
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _isConnected.value = false
                t.printStackTrace()
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _isConnected.value = false
            }
        })
    }
    
    fun sendMessage(chatId: String, receiverId: String, content: String) {
        val message = JSONObject().apply {
            put("chatId", chatId)
            put("receiverId", receiverId)
            put("content", content)
            put("type", "text")
        }
        webSocket?.send(message.toString())
    }
    
    fun disconnect() {
        webSocket?.close(1000, "User disconnected")
        webSocket = null
        _isConnected.value = false
    }
}




