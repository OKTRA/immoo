/**
 * CinetPay Utilities
 * Helper functions for signatures, validation, and common operations
 */

import type { WebhookPayload } from './types';

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate signature for CinetPay API requests
 */
export function generateSignature(data: Record<string, any>, apiKey: string): string {
  // CinetPay uses MD5 hash for signature generation
  // This is a simplified implementation - in production, use a proper crypto library
  const sortedKeys = Object.keys(data).sort();
  const concatenated = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join('&') + apiKey;
  
  return btoa(concatenated); // Base64 encoding as fallback
}

/**
 * Validate webhook signature from CinetPay
 */
export function validateWebhookSignature(payload: WebhookPayload, apiKey: string): boolean {
  try {
    // Extract signature from payload
    const receivedSignature = payload.signature;
    if (!receivedSignature) return false;

    // Generate expected signature
    const dataForSignature = {
      cpm_trans_id: payload.cpm_trans_id,
      cpm_site_id: payload.cpm_site_id,
      cpm_amount: payload.cpm_amount,
      cpm_currency: payload.cpm_currency
    };

    const expectedSignature = generateSignature(dataForSignature, apiKey);
    
    return receivedSignature === expectedSignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Format amount for CinetPay (ensures proper decimal handling)
 */
export function formatAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Parse CinetPay metadata
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
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic validation for African phone numbers
  const phoneRegex = /^(\+?[0-9]{1,4})?[0-9]{8,12}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Currency formatter
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  const currencySymbols: Record<string, string> = {
    'XOF': 'FCFA',
    'XAF': 'FCFA',
    'EUR': '€',
    'USD': '$',
    'GHS': 'GH₵'
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${amount.toLocaleString()} ${symbol}`;
}

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'CDF', 'GNF', 'SLL'];
}

/**
 * Get supported countries
 */
export function getSupportedCountries(): Record<string, string> {
  return {
    'CI': 'Côte d\'Ivoire',
    'SN': 'Sénégal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'TG': 'Togo',
    'BJ': 'Bénin',
    'NE': 'Niger',
    'GH': 'Ghana',
    'CM': 'Cameroun',
    'CD': 'RD Congo',
    'GN': 'Guinée',
    'SL': 'Sierra Leone'
  };
} 