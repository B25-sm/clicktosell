package com.example.buyandsell.config

object ApiConfig {
    // For Android emulator: use 10.0.2.2 instead of localhost
    // For physical device: use your computer's IP address (e.g., 192.168.1.100)
    // For production: use your production API URL
    const val BASE_URL = "http://10.0.2.2:5000/"
    
    // WebSocket URL
    const val WS_URL = "ws://10.0.2.2:5000"
    
    // Timeouts
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
    const val WRITE_TIMEOUT = 30L
}




