# Troubleshooting Android Build Issues

## Current Issue: SSL Certificate Error

If you're seeing "peer not authenticated" errors, this is usually due to:
1. Corporate firewall/proxy blocking SSL connections
2. Missing Java certificates
3. Network configuration issues

## Quick Fixes to Try:

### Option 1: Check Your Network
- If you're on a corporate network, you may need to configure proxy settings
- Try switching to a different network (mobile hotspot) to test

### Option 2: Update Java Certificates
```powershell
# Update Java certificates (run as Administrator)
cd "C:\Program Files\Java\jdk-*\bin"
keytool -import -alias gradle -file gradle-cert.crt -keystore "%JAVA_HOME%\lib\security\cacerts"
```

### Option 3: Use Android Studio to Build
1. Open Android Studio
2. File → Open → Select `mobile-app/android` folder
3. Let Android Studio sync Gradle (it handles SSL better)
4. Once synced, you can build from Android Studio or use the terminal again

### Option 4: Manual Dependency Download
If the build keeps failing, you can try:
1. Open Android Studio
2. Open the `mobile-app/android` project
3. Let it download all dependencies through the IDE
4. Then try `npm run android` again

### Option 5: Build APK Directly in Android Studio
1. Open `mobile-app/android` in Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Install the APK manually on your device:
   ```powershell
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

## Alternative: Use Expo (Easier Setup)
If React Native CLI continues to have issues, consider using Expo which handles Android builds in the cloud.




