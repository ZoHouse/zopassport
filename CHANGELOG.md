# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-23

First stable release. Supersedes the `0.1.x` alpha line published Dec 2025.

### Changed (BREAKING from 0.1.x)
- `sdk.auth.sendOTP(countryCode, phoneNumber, captchaToken)` now requires a third `captchaToken` argument. The Zo backend requires a Google reCAPTCHA v3 response token on every OTP request. Two-arg calls fail to type-check and are rejected by the backend.
- `ZoAuthOTPRequest` interface gains a required `captcha_response_token: string` field.
- `moment` dependency removed (was unused).

### Added
- `ZoPassportSDK` as the single entry point for all SDK features.
- Phone OTP authentication (`sendOTP`, `verifyOTP`, `loginWithPhone`).
- Automatic token refresh with configurable interval.
- Session persistence via pluggable storage adapters (`LocalStorageAdapter`, `AsyncStorageAdapter`, `MemoryStorageAdapter`).
- Profile management (`getProfile`, `updateProfile`).
- Avatar generation with polling (`generateAvatar`).
- Wallet balance (on-chain + API fallback) and transaction history.
- React integration: `ZoPassportProvider`, `useZoPassport`, `useAuth`, `useProfile`, `useAvatar`.
- React components: `ZoLanding`, `ZoAuth`, `ZoOnboarding`, `ZoPassportCard`, `ZoAvatar`, `WalletScreen`, `WalletCard`.
- React Native support with platform-specific exports.
- `create-zopassport` CLI scaffolding tool.
- Typed error classes: `ZoSDKError`, `ZoAuthError`, `ZoNetworkError`, `ZoValidationError`.
- Input validation for phone numbers and OTP codes.
- Cryptographically secure device credential generation.
- Full TypeScript type exports.
- Comprehensive test suite (unit, integration, e2e) with >89% coverage.
- `ZoPassportProvider` (React) accepts a `recaptchaSiteKey` prop. When set, the Provider's `sendOTP` wrapper automatically loads the grecaptcha v3 script, runs `grecaptcha.execute(siteKey, { action: 'request_otp' })`, and forwards the token. Built-in `<ZoAuth>` and `<ZoLanding>` components work unchanged once consumers add this prop.
- `executeRecaptcha(siteKey, action?)` helper exported from the package root. Loads grecaptcha v3 on demand and returns the response token. Web only.

### Security
- Device credentials use `crypto.randomUUID()` / `crypto.getRandomValues()` with fallback.
- RPC response validation before parsing blockchain balance data.
- Unhandled promise rejection handling in avatar polling.

### Migration from 0.1.x

Web consumers using `<ZoPassportProvider>`:
```tsx
<ZoPassportProvider clientKey={KEY} recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}>
  {children}
</ZoPassportProvider>
```

Web consumers calling the SDK directly:
```ts
import { ZoPassportSDK, executeRecaptcha } from 'zopassport';

const token = await executeRecaptcha(SITE_KEY, 'request_otp');
await sdk.auth.sendOTP('91', '9876543210', token);
```

React Native consumers (no `window.grecaptcha`): run your platform's captcha SDK (e.g. `react-native-recaptcha-that-works`) and pass the resulting token as the third argument to `sdk.auth.sendOTP`.

## [0.1.0] - [0.1.6] - 2025-12-24

Initial alpha line. Published as `zopassport@0.1.0` through `zopassport@0.1.6` on npm. API shape mirrored 1.0.0 but without captcha support, which the backend now rejects. Upgrade to 1.0.0 to restore OTP.
