package com.example.buyandsell.utils

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable

@Composable
fun rememberImagePickerLauncher(
    onImageSelected: (Uri?) -> Unit
) = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
) { uri ->
    onImageSelected(uri)
}

@Composable
fun rememberMultipleImagePickerLauncher(
    onImagesSelected: (List<Uri>) -> Unit
) = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 10)
) { uris ->
    onImagesSelected(uris)
}

fun launchImagePicker(launcher: androidx.activity.result.ActivityResultLauncher<PickVisualMediaRequest>) {
    launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
}

