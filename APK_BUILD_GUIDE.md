# Libya Build 2026 - APK Build Guide

This guide explains how to build both the **Main App** and **Scanner App** APKs.

## Prerequisites

1. **Node.js** (v18+)
2. **Android Studio** with:
   - Android SDK (API Level 33+)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
3. **Java JDK** (v17+)

## Two Applications

### 1. Main App (`com.libyabuild.app`)
- User-facing mobile app
- Features: Tickets, QR codes, Exhibitors, Speakers, etc.
- Login required (e.g., wilson@mutant.ae)

### 2. Scanner App (`com.libyabuild.scanner`)
- Admin-only app for scanning attendee QR codes
- Tracks attendance over 4 days
- Only authorized admins can access (wilson@mutant.ae)

---

## Building the Main App APK

### Step 1: Install Dependencies
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Build Web Assets
```bash
npm run build
```

### Step 3: Initialize Capacitor (first time only)
```bash
npm run cap:init
npm run cap:add:android
```

### Step 4: Sync and Open
```bash
npm run cap:sync
npm run cap:open:android
```

### Step 5: Build APK in Android Studio
1. Open Android Studio
2. Wait for Gradle sync to complete
3. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. APK will be in `android/app/build/outputs/apk/debug/`

---

## Building the Scanner App APK

### Step 1: Build Scanner Web Assets
```bash
npm run build:scanner
```

### Step 2: Create Separate Android Project
Since Capacitor uses one android folder, you have two options:

#### Option A: Use Different Config Files
```bash
# Copy scanner config
copy capacitor.config.scanner.json capacitor.config.json

# Sync with scanner settings
npx cap sync android
```

#### Option B: Manual Setup
1. Build the scanner: `npm run build:scanner`
2. Create a new Android project in Android Studio
3. Copy `dist-scanner` contents to `android/app/src/main/assets/public/`
4. Update `AndroidManifest.xml` with package name `com.libyabuild.scanner`

### Step 3: Build Scanner APK
Same as main app - use Android Studio to build the APK.

---

## App Configurations

### Main App (capacitor.config.json)
```json
{
  "appId": "com.libyabuild.app",
  "appName": "Libya Build 2026",
  "webDir": "dist"
}
```

### Scanner App (capacitor.config.scanner.json)
```json
{
  "appId": "com.libyabuild.scanner",
  "appName": "Libya Build Scanner",
  "webDir": "dist-scanner"
}
```

---

## Features Summary

### Main App Features
- **User Types**: Visitor, Exhibitor, Delegate (shown on ticket)
- **QR Code**: Contains user ID, email, name, types, and attendance
- **Attendance Tracker**: Shows 4-day attendance status
- **Protected Routes**: Login required

### Scanner App Features
- **Admin Login**: Only authorized emails (wilson@mutant.ae)
- **QR Scanning**: Camera-based scanning with manual entry fallback
- **Attendance Recording**: Tracks which day was scanned
- **Scan History**: View all past scans
- **User Type Display**: Shows visitor/exhibitor/delegate badges

---

## Authorized Scanner Admins

Currently authorized:
- wilson@mutant.ae

To add more admins, edit `src/scanner/ScannerApp.jsx`:
```javascript
const SCANNER_ADMINS = ['wilson@mutant.ae', 'another@admin.com']
```

---

## Testing Locally

### Main App
```bash
npm run dev
# Access at http://localhost:3000
```

### Scanner App
```bash
npm run dev:scanner
# Access at http://localhost:3001
```

Or access scanner via main app at: `http://localhost:3000/scanner`

---

## Release Build (Signed APK)

1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Select **APK**
3. Create or select keystore
4. Choose **release** build variant
5. Find APK in `android/app/build/outputs/apk/release/`

---

## Troubleshooting

### Camera Not Working in Scanner
- Ensure camera permissions are granted
- Check `AndroidManifest.xml` includes camera permission
- Use HTTPS or localhost for camera access

### Build Errors
- Run `npx cap doctor` to diagnose
- Ensure JAVA_HOME is set correctly
- Try `npm run cap:sync` to refresh

### Login Issues
- Verify Supabase environment variables
- Check user exists in Supabase Auth
- Ensure email is confirmed
