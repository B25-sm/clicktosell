# Android Setup Guide

## Prerequisites

1. **Install Node.js** (v16 or higher)
2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 33)
   - Install Android SDK Build-Tools
   - Install Android Emulator or connect a physical device

3. **Set up Environment Variables**
   ```bash
   # Add to your ~/.bash_profile or ~/.zshrc
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Link Native Modules** (if needed)
   ```bash
   npx react-native link
   ```

3. **Start Metro Bundler**
   ```bash
   npm start
   ```

4. **Run on Android** (in a new terminal)
   ```bash
   npm run android
   ```

## Troubleshooting

### Issue: "SDK location not found"
Solution: Create `android/local.properties` with:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### Issue: "Command not found: adb"
Solution: Install Android SDK Platform-Tools through Android Studio

### Issue: Gradle Build Failed
Solution: 
1. Clean the project: `cd android && ./gradlew clean && cd ..`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Rebuild: `npm run android`

### Issue: "Unable to load script"
Solution:
1. Stop Metro bundler
2. Clear cache: `npm start -- --reset-cache`
3. Run again: `npm run android`

## Running on Physical Device

1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect phone via USB
4. Run `npm run android`

## Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

