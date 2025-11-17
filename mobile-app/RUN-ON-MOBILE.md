# Running the Mobile App on Your Device

## Quick Start Guide

### Prerequisites

1. **Node.js** (v16 or higher) - ✅ Already installed
2. **Android Studio** - Download from https://developer.android.com/studio
   - Install Android SDK (API 33)
   - Install Android SDK Build-Tools
   - Set up Android Emulator OR connect a physical device

### Step 1: Set Up Android SDK Path (Windows)

1. Find your Android SDK location (usually: `C:\Users\YourUsername\AppData\Local\Android\Sdk`)
2. Create or edit `mobile-app/android/local.properties`:
   ```
   sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
   ```
   (Replace `YourUsername` with your actual Windows username)

### Step 2: Start the Backend Server

The mobile app needs the backend running. In a terminal:

```bash
cd backend
npm install  # if not already done
npm start
```

The backend should run on `http://localhost:5000`

### Step 3: Start Metro Bundler

In a new terminal:

```bash
cd mobile-app
npm start
```

Keep this terminal open - Metro bundler needs to keep running.

### Step 4: Run on Android

#### Option A: Android Emulator
1. Open Android Studio
2. Start an Android Virtual Device (AVD)
3. Wait for emulator to fully boot
4. In a new terminal:
   ```bash
   cd mobile-app
   npm run android
   ```

#### Option B: Physical Android Device
1. Enable **Developer Options** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. Allow USB debugging when prompted
5. Run:
   ```bash
   cd mobile-app
   npm run android
   ```

### Step 5: For Physical Device (Alternative - WiFi)

If you want to run on a physical device over WiFi instead of USB:

1. Connect device and computer to same WiFi network
2. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Example: `192.168.1.100`
3. Update `mobile-app/src/config/env.ts`:
   ```typescript
   devHost = Platform.OS === 'android' ? '192.168.1.100' : '127.0.0.1';
   ```
   (Replace `192.168.1.100` with your actual IP)
4. Shake device → Dev Settings → Change Bundle Location to: `192.168.1.100:8081`

## Troubleshooting

### "SDK location not found"
- Create `mobile-app/android/local.properties` with your SDK path (see Step 1)

### "Command not found: adb"
- Install Android SDK Platform-Tools through Android Studio
- Add to PATH: `C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools`

### "Unable to load script"
```bash
cd mobile-app
npm start -- --reset-cache
```

### "Metro bundler can't connect"
- Make sure backend is running on port 5000
- Check firewall settings
- For physical device: Use WiFi method or ensure USB debugging is enabled

### Build fails
```bash
cd mobile-app/android
.\gradlew clean
cd ..
npm run android
```

## Building Release APK

To create an installable APK:

```bash
cd mobile-app/android
.\gradlew assembleRelease
```

APK location: `mobile-app/android/app/build/outputs/apk/release/app-release.apk`

## Current Configuration

- **API URL (Development)**: `http://10.0.2.2:5000` (Android Emulator)
- **API URL (Physical Device)**: Update `env.ts` with your computer's IP
- **Backend Port**: 5000
- **Metro Port**: 8081




