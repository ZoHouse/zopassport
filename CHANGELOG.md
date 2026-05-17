# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-18

### Added
- `libphonenumber-js/mobile` powers `COUNTRY_CODES`; the list now includes all ~250 ITU-T E.164 countries instead of a curated 20.
- New helpers: `isValidPhoneNumber(phone, country?)`, `formatAsYouType(phone, country)`, `getCountryByDialCode(code)`, `getCountryByIso(iso)`.
- New `Country` type export for the `COUNTRY_CODES` entry shape.
- `validatePhoneNumber(phoneNumber, country?)` now performs country-specific validation when a country is supplied (ISO alpha-2 or dial code).
- `validateCountryCode` now accepts ISO alpha-2 codes in addition to dial codes and verifies the code maps to a known country.
- `PhoneInput` is now a searchable combobox: click to open, filter by country name / ISO / dial code.

### Changed
- `formatPhoneNumber(phone, country?)` accepts an optional country and uses libphonenumber-js's national formatting when supplied. Existing single-arg behavior preserved for backward compat.

### Notes
- `COUNTRY_CODES` export shape (`{ code, country, flag, name }`) is unchanged.
- Country names are derived via `Intl.DisplayNames` (English).

## [1.0.0] - 2025-03-22

### Added
- `ZoPassportSDK` — single entry point for all SDK features
- Phone OTP authentication (`sendOTP`, `verifyOTP`, `loginWithPhone`)
- Automatic token refresh with configurable interval
- Session persistence via pluggable storage adapters (`LocalStorageAdapter`, `AsyncStorageAdapter`, `MemoryStorageAdapter`)
- Profile management (`getProfile`, `updateProfile`)
- Avatar generation with polling (`generateAvatar`)
- Wallet balance (on-chain + API fallback) and transaction history
- React integration: `ZoPassportProvider`, `useZoPassport`, `useAuth`, `useProfile`, `useAvatar`
- React components: `ZoLanding`, `ZoAuth`, `ZoOnboarding`, `ZoPassportCard`, `ZoAvatar`, `WalletScreen`, `WalletCard`
- React Native support with platform-specific exports
- `create-zopassport` CLI scaffolding tool
- Typed error classes: `ZoSDKError`, `ZoAuthError`, `ZoNetworkError`, `ZoValidationError`
- Input validation for phone numbers and OTP codes
- Cryptographically secure device credential generation
- Full TypeScript type exports
- Comprehensive test suite (unit, integration, e2e) with >89% coverage

### Security
- Device credentials now use `crypto.randomUUID()` / `crypto.getRandomValues()` with fallback
- RPC response validation before parsing blockchain balance data
- Unhandled promise rejection handling in avatar polling
