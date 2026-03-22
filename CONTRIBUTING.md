# Contributing to Zo Passport SDK

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
git clone https://github.com/ZoHouse/zopassport.git
cd zopassport
npm install --legacy-peer-deps
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the SDK with tsup |
| `npm run dev` | Build in watch mode |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run end-to-end tests only |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
  ZoPassportSDK.ts     # Main SDK class
  index.ts             # Core exports (framework-agnostic)
  react.tsx            # React-specific exports (Provider, hooks, components)
  react-native.tsx     # React Native-specific exports
  lib/
    api/               # API client and endpoint modules
    types/             # TypeScript type definitions
    utils/             # Utility functions (storage, phone, wallet, logger)
  hooks/               # React hooks
  components/          # React/RN UI components
tests/
  unit/                # Unit tests for individual modules
  integration/         # Integration tests for SDK flows
  e2e/                 # End-to-end user journey tests
```

## Pull Request Process

1. Fork the repository and create your branch from `main`
2. Write tests for any new functionality
3. Ensure all tests pass: `npm test`
4. Ensure type checking passes: `npm run type-check`
5. Update documentation if you changed public APIs
6. Submit your pull request with a clear description

## Code Style

- TypeScript strict mode is enabled
- Use async/await over raw promises
- All public methods must have JSDoc comments
- Error handling: use the typed error classes in `src/lib/errors.ts`
- Storage: always use the `StorageAdapter` interface, never access localStorage directly

## Reporting Issues

Open an issue at [github.com/ZoHouse/zopassport/issues](https://github.com/ZoHouse/zopassport/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- SDK version and environment (web/React Native)
