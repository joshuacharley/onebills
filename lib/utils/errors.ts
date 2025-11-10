/**
 * Structured Error Management System
 * Provides consistent error handling across the application
 */

export enum ErrorCode {
  // Authentication Errors
  AUTH_NOT_AUTHENTICATED = 'AUTH_NOT_AUTHENTICATED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_PHONE_ALREADY_EXISTS = 'AUTH_PHONE_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_INVALID_EMAIL = 'AUTH_INVALID_EMAIL',
  AUTH_INVALID_PHONE = 'AUTH_INVALID_PHONE',
  AUTH_INVALID_OTP = 'AUTH_INVALID_OTP',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_RATE_LIMIT = 'AUTH_RATE_LIMIT',

  // Profile Errors
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_UPDATE_FAILED = 'PROFILE_UPDATE_FAILED',
  PROFILE_KYC_PENDING = 'PROFILE_KYC_PENDING',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  VALIDATION_REQUIRED = 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',

  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  originalError?: any;
  details?: Record<string, any>;
}

/**
 * Create a structured application error
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  userMessage: string,
  originalError?: any,
  details?: Record<string, any>
): AppError {
  return {
    code,
    message,
    userMessage,
    originalError,
    details,
  };
}

/**
 * Handle Supabase errors and convert to structured AppError
 */
export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred',
      'Something went wrong. Please try again.'
    );
  }

  // If it's already an AppError, return it
  if (error.code && error.userMessage) {
    return error as AppError;
  }

  const errorMessage = error.message || String(error);
  const errorCode = error.code || error.status || '';

  // Map Supabase error codes to our error codes
  switch (errorCode) {
    // Authentication errors
    case 'invalid_credentials':
    case 'invalid_grant':
      return createAppError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        errorMessage,
        'Invalid email or password. Please check your credentials and try again.',
        error
      );

    case 'email_not_confirmed':
      return createAppError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        errorMessage,
        'Please verify your email address before signing in.',
        error
      );

    case 'signup_disabled':
      return createAppError(
        ErrorCode.OPERATION_FAILED,
        errorMessage,
        'Registration is currently disabled. Please contact support.',
        error
      );

    case 'user_already_registered':
      return createAppError(
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        errorMessage,
        'An account with this email already exists. Please sign in instead.',
        error
      );

    case 'phone_already_registered':
      return createAppError(
        ErrorCode.AUTH_PHONE_ALREADY_EXISTS,
        errorMessage,
        'An account with this phone number already exists. Please sign in instead.',
        error
      );

    case 'invalid_otp':
    case 'token_not_found':
      return createAppError(
        ErrorCode.AUTH_INVALID_OTP,
        errorMessage,
        'Invalid verification code. Please check and try again.',
        error
      );

    case 'expired_otp':
      return createAppError(
        ErrorCode.AUTH_INVALID_OTP,
        errorMessage,
        'Verification code has expired. Please request a new one.',
        error
      );

    case 'rate_limit_exceeded':
      return createAppError(
        ErrorCode.AUTH_RATE_LIMIT,
        errorMessage,
        'Too many attempts. Please wait a few minutes and try again.',
        error
      );

    // Network errors
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
      return createAppError(
        ErrorCode.NETWORK_TIMEOUT,
        errorMessage,
        'Request timed out. Please check your connection and try again.',
        error
      );

    case 'ERR_NETWORK':
    case 'Network request failed':
      return createAppError(
        ErrorCode.NETWORK_ERROR,
        errorMessage,
        'Network error. Please check your internet connection and try again.',
        error
      );

    // Database errors
    case 'PGRST116':
      // No rows returned - this is often expected (e.g., profile doesn't exist)
      return createAppError(
        ErrorCode.PROFILE_NOT_FOUND,
        errorMessage,
        'Profile not found.',
        error
      );

    case '23505': // Unique violation
      return createAppError(
        ErrorCode.OPERATION_FAILED,
        errorMessage,
        'This information is already in use. Please use different details.',
        error
      );

    case '23503': // Foreign key violation
      return createAppError(
        ErrorCode.OPERATION_FAILED,
        errorMessage,
        'Invalid reference. Please check your information and try again.',
        error
      );

    // Default error handling
    default:
      // Check error message for common patterns
      if (errorMessage.toLowerCase().includes('not authenticated')) {
        return createAppError(
          ErrorCode.AUTH_NOT_AUTHENTICATED,
          errorMessage,
          'You need to sign in to continue.',
          error
        );
      }

      if (errorMessage.toLowerCase().includes('network')) {
        return createAppError(
          ErrorCode.NETWORK_ERROR,
          errorMessage,
          'Network error. Please check your connection and try again.',
          error
        );
      }

      if (errorMessage.toLowerCase().includes('timeout')) {
        return createAppError(
          ErrorCode.NETWORK_TIMEOUT,
          errorMessage,
          'Request timed out. Please try again.',
          error
        );
      }

      // Generic error
      return createAppError(
        ErrorCode.OPERATION_FAILED,
        errorMessage,
        'An error occurred. Please try again.',
        error
      );
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  // If it's an AppError, return userMessage
  if (error.userMessage) {
    return error.userMessage;
  }

  // If it's a Supabase error, handle it
  if (error.message || error.code) {
    const appError = handleSupabaseError(error);
    return appError.userMessage;
  }

  // Fallback to error string
  return String(error);
}

/**
 * Check if error is a specific type
 */
export function isErrorCode(error: any, code: ErrorCode): boolean {
  if (!error) return false;
  
  if (error.code === code) return true;
  
  const appError = handleSupabaseError(error);
  return appError.code === code;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return isErrorCode(error, ErrorCode.NETWORK_ERROR) ||
         isErrorCode(error, ErrorCode.NETWORK_TIMEOUT) ||
         isErrorCode(error, ErrorCode.NETWORK_OFFLINE);
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error?.code?.startsWith('AUTH_') || 
         isErrorCode(error, ErrorCode.AUTH_NOT_AUTHENTICATED);
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    const appError = handleSupabaseError(error);
    console.error(`[${context || 'Error'}]`, {
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage,
      originalError: appError.originalError,
      details: appError.details,
    });
  }
}
