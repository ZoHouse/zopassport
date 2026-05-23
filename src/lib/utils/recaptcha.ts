// src/lib/utils/recaptcha.ts
// Google reCAPTCHA v3 helper. Web only.

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ATTR = 'data-zopassport-recaptcha';

function loadScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[${SCRIPT_ATTR}]`);
    if (existing) {
      if (window.grecaptcha) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.setAttribute(SCRIPT_ATTR, '');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(script);
  });
}

/**
 * Execute a Google reCAPTCHA v3 challenge and return the response token.
 *
 * Loads the grecaptcha script on first call, then invokes
 * `grecaptcha.execute(siteKey, { action })`. Pass the returned token to
 * `sdk.auth.sendOTP(cc, phone, token)`.
 *
 * Web only. Throws if called in an environment without `window` (e.g. React
 * Native, SSR). On RN, run your platform's captcha SDK and pass the token to
 * `sendOTP` directly.
 */
export async function executeRecaptcha(siteKey: string, action: string = 'request_otp'): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('executeRecaptcha is web-only. On React Native, pass a captchaToken to sdk.auth.sendOTP directly.');
  }
  if (!siteKey) {
    throw new Error('executeRecaptcha: siteKey is required');
  }

  await loadScript(siteKey);

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA loaded but window.grecaptcha is undefined');
  }

  await new Promise<void>((resolve) => window.grecaptcha!.ready(() => resolve()));
  return window.grecaptcha.execute(siteKey, { action });
}
