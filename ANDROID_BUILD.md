# Android APK Build Guide

This guide explains how to build an Android APK from the Libya Build web application using Capacitor.

## Prerequisites

1. **Node.js** (v18+)
2. **Android Studio** with:
   - Android SDK (API Level 33+)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
3. **Java JDK** (v17+)

## Setup Instructions

### 1. Install Capacitor Dependencies

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Initialize Capacitor (if not already done)

```bash
npm run cap:init
```

### 3. Add Android Platform

```bash
npm run cap:add:android
```

### 4. Build and Sync

```bash
npm run android:build
```

### 5. Open in Android Studio

```bash
npm run cap:open:android
```

## Building the APK

### Debug APK

1. Open the project in Android Studio
2. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Find the APK in `android/app/build/outputs/apk/debug/`

### Release APK (Signed)

1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Select **APK**
3. Create or use existing keystore
4. Select **release** build variant
5. APK will be in `android/app/build/outputs/apk/release/`

## Project Configuration

The `capacitor.config.json` contains:
- **appId**: `com.libyabuild.app`
- **appName**: `Libya Build 2026`
- **webDir**: `dist` (Vite build output)

## Native Features

The app includes JSX wrappers for:
- **Status Bar** - Custom color (#2264dc)
- **Splash Screen** - Branded loading screen
- **Push Notifications** - Firebase Cloud Messaging ready
- **Hardware Back Button** - Native Android navigation
- **App State Changes** - Background/foreground detection

## Components

### NativeWrapper (`src/components/NativeWrapper.jsx`)
Wraps the entire application and initializes native plugins when running in Capacitor.

### AppInstallBanner (`src/components/AppInstallBanner.jsx`)
Shows an install prompt on the home page for:
- PWA installation (all platforms)
- APK download (Android devices)

## Troubleshooting

### Build Fails
- Ensure Android SDK is properly configured
- Check JAVA_HOME environment variable
- Run `npx cap doctor` to diagnose issues

### App Crashes on Launch
- Check logcat in Android Studio
- Ensure all native plugins are properly initialized

### Assets Not Loading
- Run `npm run build` before `npx cap sync`
- Check that `webDir` in capacitor.config.json matches build output

## Useful Commands

```bash
# Full Android build
npm run android:build

# Sync web assets to native project
npm run cap:sync

# Open Android Studio
npm run cap:open:android

# Run on connected device/emulator
npm run android:run
```
