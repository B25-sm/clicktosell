# Classifieds Mobile App

A beautiful and modern mobile application for classified advertisements built with React Native.

## Features

- 🎨 Modern UI with brand colors (Midnight Blue #0A0F2C, Warm Gold #FFD100, Soft Light Gray #E5E5E5)
- 📱 Cross-platform support (iOS & Android)
- 🔍 Search and filter listings
- 💬 Real-time chat functionality
- 📍 Location-based listings
- ⭐ Favorites and bookmarks
- 💳 Payment integration
- 🔔 Push notifications

## Screens

### Home Screen
- Featured listings with horizontal scroll
- Category grid
- Recent listings in grid layout
- Search functionality
- Location selection

### Components

#### UI Components
- `LoadingScreen` - Loading indicator with brand colors
- `ErrorMessage` - Error display with retry option
- `SearchBar` - Beautiful search input
- `LocationBanner` - Location selector

#### Layout Components
- `Header` - App header with menu and notifications

#### Listings Components
- `FeaturedListings` - Horizontal scrollable featured items
- `RecentListings` - Grid layout for recent listings
- `CategoryGrid` - Category selection grid

## Setup

### Prerequisites
- Node.js >= 16
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── store/            # Redux store
│   ├── services/         # API services
│   ├── theme/            # Theme configuration
│   └── config/           # App configuration
├── App.tsx               # Root component
└── package.json
```

## Color Palette

- **Primary**: #0A0F2C (Midnight Blue)
- **Accent**: #FFD100 (Warm Gold)
- **Support**: #E5E5E5 (Soft Light Gray)

## Technologies

- React Native
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Vector Icons
- React Native Gesture Handler
- React Native Reanimated

## Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Building

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## License

MIT

