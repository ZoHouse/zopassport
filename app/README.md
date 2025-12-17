# Development Playground

This directory is a **local development environment** for testing Zo Passport SDK components.

## Purpose

- Test React Native components in a web environment using mocks
- Preview UI components during development
- **NOT published to npm** (excluded from `files` in package.json)

## Setup

```bash
cd app
npm install
npm run dev
```

## Mocks

- `reanimated-mock.js` - Mocks `react-native-reanimated` for web
- `svg-mock.js` - Mocks `react-native-svg` for web

## Note

The components here may be **out of sync** with the main `src/` directory.
Always develop in `src/` and use this playground for quick visual testing.

