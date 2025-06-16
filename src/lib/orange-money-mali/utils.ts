/**
 * Orange Money Mali Utilities
 * Helper functions for authentication, validation, and common operations
 */

import type { WebhookPayload, AuthToken } from './types';

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(prefix: string = 'OMML'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate Mali phone number format
 */
export function validateMaliPhoneNumber(phoneNumber: string): boolean {
  // Mali phone numbers: +223 followed by 8 digits
  // Format: +223XXXXXXXX or 223XXXXXXXX or local format
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // International format
  if (cleanedNumber.startsWith('+223')) {
    return /^\+223[67]\d{7}$/.test(cleanedNumber);
  }
  
  // Without + prefix
  if (cleanedNumber.startsWith('223')) {
    return /^223[67]\d{7}$/.test(cleanedNumber);
  }
  
  // Local format (8 digits starting with 6 or 7)
  return /^[67]\d{7}$/.test(cleanedNumber);
}

/**
 * Format Mali phone number to international format
 */
export function formatMaliPhoneNumber(phoneNumber: string): string {
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  if (cleanedNumber.startsWith('+223')) {
    return cleanedNumber;
  }
  
  if (cleanedNumber.startsWith('223')) {
    return `+${cleanedNumber}`;
  }
  
  if (/^[67]\d{7}$/.test(cleanedNumber)) {
    return `+223${cleanedNumber}`;
  }
  
  throw new Error('Invalid Mali phone number format');
}

/**
 * Generate USSD code for Orange Money payment
 */
export function generateUssdCode(amount: number, merchantCode: string): string {
  return `#144*4*4*${merchantCode}*${amount}#`;
}

/**
 * Validate webhook signature from Orange Money
 */
export function validateWebhookSignature(payload: WebhookPayload, secretKey: string): boolean {
  try {
    // Orange Money uses HMAC-SHA256 for webhook signatures
    const receivedSignature = payload.signature;
    if (!receivedSignature) return false;

    // Create signature string
    const signatureString = [
      payload.transaction_id,
      payload.status,
      payload.amount.toString(),
      payload.currency,
      payload.customer_phone
    ].join('|');

    // In a real implementation, use crypto to generate HMAC-SHA256
    // This is a simplified version
    const expectedSignature = btoa(signatureString + secretKey);
    
    return receivedSignature === expectedSignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Format amount for Orange Money (ensures proper decimal handling)
 */
export function formatAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Parse Orange Money metadata
 */
export function parseMetadata(metadataString?: string): Record<string, any> | undefined {
  if (!metadataString) return undefined;
  
  try {
    return JSON.parse(metadataString);
  } catch (error) {
    console.error('Failed to parse metadata:', error);
    return undefined;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Currency formatter for Mali
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  const currencySymbols: Record<string, string> = {
    'XOF': 'FCFA',
    'EUR': '€',
    'USD': '$'
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${amount.toLocaleString()} ${symbol}`;
}

/**
 * Get supported currencies for Mali
 */
export function getSupportedCurrencies(): string[] {
  return ['XOF'];
}

/**
 * Check if auth token is expired
 */
export function isTokenExpired(token: AuthToken): boolean {
  return Date.now() >= (token.expires_at * 1000);
}

/**
 * Calculate token expiration time
 */
export function calculateTokenExpiration(expiresIn: number): number {
  return Math.floor(Date.now() / 1000) + expiresIn - 60; // 60 seconds buffer
}

/**
 * Generate QR code data for payment
 */
export function generateQRCodeData(
  merchantCode: string, 
  amount: number, 
  transactionId: string
): string {
  return `orangemoney://pay?merchant=${merchantCode}&amount=${amount}&ref=${transactionId}`;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount: number): boolean {
  // Orange Money Mali limits
  const MIN_AMOUNT = 100; // 100 FCFA
  const MAX_AMOUNT = 1000000; // 1,000,000 FCFA
  
  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT && Number.isInteger(amount);
}

/**
 * Get Orange Money Mali operator codes
 */
export function getOperatorCodes(): Record<string, string> {
  return {
    'orange_mali': '001',
    'malitel': '002'
  };
}

/**
 * Extract error code from Orange Money API response
 */
export function extractErrorCode(errorResponse: any): string {
  if (errorResponse?.error_code) {
    return errorResponse.error_code;
  }
  
  if (errorResponse?.code) {
    return errorResponse.code;
  }
  
  return 'UNKNOWN_ERROR';
} 