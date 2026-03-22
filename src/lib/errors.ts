/**
 * Base error class for all Zo Passport SDK errors.
 * All SDK errors extend this class, so you can catch all SDK errors with:
 * ```ts
 * try { ... } catch (e) { if (e instanceof ZoSDKError) { ... } }
 * ```
 */
export class ZoSDKError extends Error {
  /** Machine-readable error code */
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ZoSDKError';
    this.code = code;
  }
}

/**
 * Thrown when authentication fails (invalid OTP, expired token, etc.)
 */
export class ZoAuthError extends ZoSDKError {
  /** HTTP status code from the API, if available */
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message, 'AUTH_ERROR');
    this.name = 'ZoAuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Thrown when an API request fails due to network issues.
 */
export class ZoNetworkError extends ZoSDKError {
  constructor(message: string = 'Network request failed. Check your connection and try again.') {
    super(message, 'NETWORK_ERROR');
    this.name = 'ZoNetworkError';
  }
}

/**
 * Thrown when input validation fails (invalid phone number, missing fields, etc.)
 */
export class ZoValidationError extends ZoSDKError {
  /** The field that failed validation */
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ZoValidationError';
    this.field = field;
  }
}

/**
 * Thrown when an operation requires authentication but the user is not logged in.
 */
export class ZoNotAuthenticatedError extends ZoSDKError {
  constructor() {
    super('Not authenticated. Call loginWithPhone() first.', 'NOT_AUTHENTICATED');
    this.name = 'ZoNotAuthenticatedError';
  }
}

/**
 * Thrown when the SDK is initialized with invalid configuration.
 */
export class ZoConfigError extends ZoSDKError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ZoConfigError';
  }
}
