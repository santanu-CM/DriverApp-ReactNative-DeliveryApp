# Kaya Driver App

A React Native mobile application for drivers, featuring real-time location tracking, order management, navigation, and payment integration.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (>= 18)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DriverAppUpdated
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios
pod install
cd ..
```

4. Apply patches (automatically runs via postinstall script):
```bash
npm run postinstall
```

## Running the Application

### Start Metro Bundler

First, start the Metro bundler:

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

### Run on iOS

```bash
npm run ios
# or
yarn ios
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean Android build

## Project Structure

```
DriverAppUpdated/
├── android/          # Android native code
├── ios/              # iOS native code
├── src/
│   ├── assets/       # Images, fonts, and other assets
│   ├── components/   # Reusable UI components
│   ├── context/      # React Context providers
│   ├── helper/       # Helper functions and services
│   ├── model/        # Data models
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # Screen components
│   ├── store/        # Redux store and slices
│   └── utils/        # Utility functions
├── patches/          # Package patches
└── __tests__/        # Test files
```

## Key Features

- Real-time location tracking and background location services
- Firebase integration (Authentication, Firestore, Realtime Database, Storage, Messaging)
- Google Maps integration with directions
- Order management and delivery tracking
- Payment integration (Razorpay)
- Push notifications
- Offline support
- Document picker and file management
- Image picker and cropping
- Chat functionality
- Calendar and date pickers

## Technologies Used

- React Native 0.80.1
- React Navigation
- Redux Toolkit
- Firebase
- React Native Maps
- React Native Reanimated
- Socket.io
- Axios

## Configuration

### Android

1. Place your `google-services.json` file in `android/app/`
2. Configure your signing keys in `android/app/build.gradle`

### iOS

1. Place your `GoogleService-Info.plist` file in `ios/KayaDriverApp/`
2. Configure your bundle identifier and signing in Xcode

## Important Notes

### Package Updates

Some packages have been updated or replaced:

- `@react-native-documents/picker` (new) replaces `react-native-document-picker` (old)
- `@d11/react-native-fast-image` (new) replaces `react-native-fast-image` (old)
- `@react-native-clipboard/clipboard` (new) replaces `@react-native-community/clipboard` (old)
- `react-native-star-rating-widget` (new) replaces `react-native-star-rating` (old)

### Asset Linking

To link assets after installation:
```bash
npx react-native-asset
```

### Patches

This project uses `patch-package` to apply custom patches to dependencies. Patches are automatically applied during `npm install` via the postinstall script.

## Troubleshooting

### Clean Build

If you encounter build issues, try cleaning the build:

```bash
npm run clean
```

### Reset Metro Cache

```bash
npm start -- --reset-cache
```

### iOS Pod Issues

If you encounter CocoaPods issues:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

## License

This project is private and proprietary.
