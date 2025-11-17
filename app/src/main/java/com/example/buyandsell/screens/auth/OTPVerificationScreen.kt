package com.example.buyandsell.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.buyandsell.navigation.Screen
import com.example.buyandsell.ui.theme.PrimaryBlue

@Composable
fun OTPVerificationScreen(navController: NavController) {
    var otp by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Verify OTP",
            style = MaterialTheme.typography.headlineLarge.copy(
                fontWeight = FontWeight.Bold,
                color = PrimaryBlue
            ),
            modifier = Modifier.padding(bottom = 8.dp)
        )

        Text(
            text = "Enter the OTP sent to your phone",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            modifier = Modifier.padding(bottom = 32.dp)
        )

        OutlinedTextField(
            value = otp,
            onValueChange = { if (it.length <= 6) otp = it },
            label = { Text("OTP") },
            placeholder = { Text("000000") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            shape = RoundedCornerShape(12.dp),
            singleLine = true
        )

        Button(
            onClick = {
                isLoading = true
                // TODO: Implement OTP verification
                isLoading = false
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            enabled = !isLoading && otp.length == 6
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            } else {
                Text("Verify", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }

        TextButton(
            onClick = { /* Resend OTP */ },
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Resend OTP")
        }
    }
}




