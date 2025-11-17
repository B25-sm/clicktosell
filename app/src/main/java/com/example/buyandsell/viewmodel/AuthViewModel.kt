package com.example.buyandsell.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.buyandsell.data.api.RetrofitClient
import com.example.buyandsell.data.local.PreferencesManager
import com.example.buyandsell.data.models.AuthResponse
import com.example.buyandsell.data.models.LoginRequest
import com.example.buyandsell.data.models.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = RetrofitClient.apiService
    private val preferencesManager = PreferencesManager(application)

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            preferencesManager.authToken.collect { token ->
                _isLoggedIn.value = !token.isNullOrEmpty()
            }
        }
    }

    fun login(identifier: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = apiService.login(LoginRequest(identifier, password))
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    authData?.let {
                        preferencesManager.saveToken(it.token)
                        it.refreshToken?.let { refreshToken ->
                            preferencesManager.saveRefreshToken(refreshToken)
                        }
                        preferencesManager.saveUserId(it.user.id)
                        _authState.value = AuthState.Success(it.user)
                        _isLoggedIn.value = true
                    } ?: run {
                        _authState.value = AuthState.Error("Login failed")
                    }
                } else {
                    _authState.value = AuthState.Error(response.body()?.message ?: "Login failed")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Network error")
            }
        }
    }

    fun register(
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        password: String,
        city: String
    ) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = apiService.register(
                    RegisterRequest(firstName, lastName, email, phone, password, city)
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    authData?.let {
                        preferencesManager.saveToken(it.token)
                        it.refreshToken?.let { refreshToken ->
                            preferencesManager.saveRefreshToken(refreshToken)
                        }
                        preferencesManager.saveUserId(it.user.id)
                        _authState.value = AuthState.Success(it.user)
                        _isLoggedIn.value = true
                    } ?: run {
                        _authState.value = AuthState.Error("Registration failed")
                    }
                } else {
                    _authState.value = AuthState.Error(response.body()?.message ?: "Registration failed")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Network error")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            preferencesManager.clearAll()
            _isLoggedIn.value = false
            _authState.value = AuthState.Idle
        }
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: com.example.buyandsell.data.models.User) : AuthState()
    data class Error(val message: String) : AuthState()
}




