# Deployment Guide

## Play Store Deployment

### Prerequisites
- Google Play Developer Account ($25 one-time fee)
- Android Studio with latest SDK
- Signed APK or AAB bundle

### Build Steps

1. **Generate Release APK/AAB**
   ```bash
   flutter build apk --release
   flutter build appbundle --release
   ```

2. **Generate Signing Keys**
   ```bash
   keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias al_quran
   ```

3. **Configure Gradle**
   - Add keystore path in `android/key.properties`
   - Update `android/app/build.gradle` to sign the bundle

4. **Create Store Listing**
   - App Name: Al-Quran
   - Short Description: Read, listen, and learn from the Holy Quran
   - Full Description: A premium, ad-free Quran reading and listening application with offline support, audio playback, bookmarks, and tafsir.

5. **Screenshots**
   - Create 1280x720px screenshots for various device sizes
   - Include: Home screen, Reading screen, Audio player, Bookmarks, Settings

6. **Privacy Policy**
   - Create a privacy policy page
   - Add URL to Play Store listing

7. **Submit to Play Store**
   - Go to Google Play Console
   - Create new app
   - Upload signed bundle
   - Complete all required information
   - Submit for review (typically 1-3 days)

## iOS App Store Deployment

### Prerequisites
- Apple Developer Account ($99/year)
- macOS with Xcode
- Provisioning profile and certificates

### Build Steps

1. **Generate Release Build**
   ```bash
   flutter build ios --release
   ```

2. **Configure Signing**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select your team in Signing & Capabilities
   - Update Bundle Identifier

3. **Generate Archive**
   - Product > Archive
   - Distribute App > App Store Connect

4. **App Store Listing**
   - App Name: Al-Quran
   - Subtitle: Read, Listen, Learn
   - Keywords: Quran, Holy Quran, Islamic, Islamic App, Quran App
   - Description: A premium, ad-free Quran reading and listening application with offline support, audio playback, bookmarks, and tafsir.

5. **Screenshots**
   - Create 1284x2778px screenshots for iPhone
   - Create 1536x2048px screenshots for iPad
   - Include: Home screen, Reading screen, Audio player, Bookmarks, Settings

6. **Submit to App Store**
   - Go to App Store Connect
   - Create new app
   - Upload archive
   - Complete all required information
   - Submit for review (typically 1-3 days)

## Web Deployment (Firebase Hosting)

### Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project

### Setup Steps

1. **Initialize Firebase**
   ```bash
   cd web
   firebase init
   ```
   Select:
   - Hosting: Configure and deploy Firebase Hosting sites
   - Use an existing project
   - Public directory: `build/web`
   - Configure as single-page app: Yes

2. **Build Flutter Web**
   ```bash
   flutter build web
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

4. **Configure Custom Domain (Optional)**
   - Add custom domain in Firebase Console
   - Configure DNS records

5. **Enable HTTPS**
   - Firebase Hosting provides HTTPS by default

### Optimizations

1. **Enable Service Worker**
   - Firebase automatically enables service worker for caching

2. **Configure Cache-Control**
   - Set appropriate cache headers for static assets

3. **Analytics**
   - Add Firebase Analytics for tracking
   - Enable Crashlytics for error reporting

## Performance Optimization

### Android
- Enable R8/ProGuard in `android/app/build.gradle`
- Use App Bundle for smaller downloads
- Compress PNG images

### iOS
- Enable App Thinning
- Use Asset Catalogs
- Optimize images for retina displays

### Web
- Enable compression
- Use CDN for static assets
- Implement lazy loading for images

## Continuous Integration (Optional)

### GitHub Actions
```yaml
name: Flutter CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.12.2'
      - run: flutter pub get
      - run: flutter test
      - run: flutter analyze
```

## Post-Launch

1. **Monitor App Store Connect**
   - Check daily downloads
   - Monitor reviews and ratings
   - Track crash reports

2. **Collect User Feedback**
   - Implement in-app feedback mechanism
   - Monitor support requests

3. **Regular Updates**
   - Fix bugs as they appear
   - Add requested features
   - Update dependencies regularly
