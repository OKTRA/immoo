/**
 * CinetPay Configuration
 * Manage API keys and environment settings
 */

import type { CinetPayConfig } from './types';

export class CinetPayConfigManager {
  private config: CinetPayConfig;

  constructor(config: CinetPayConfig) {
    this.validateConfig(config);
    this.config = {
      environment: 'production',
      defaultCurrency: 'XOF',
      defaultLanguage: 'fr',
      ...config
    };
  }

  private validateConfig(config: CinetPayConfig): void {
    if (!config.apiKey || !config.siteId) {
      throw new Error('CinetPay API key and Site ID are required');
    }
  }

  public getConfig(): CinetPayConfig {
    return { ...this.config };
  }

  public getApiUrl(): string {
    return this.config.environment === 'sandbox' 
      ? 'https://api-checkout.cinetpay.com/v2'
      : 'https://api-checkout.cinetpay.com/v2';
  }

  public updateConfig(newConfig: Partial<CinetPayConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig(this.config);
  }
}

// Environment-based configuration helper
export function createConfigFromEnv(): CinetPayConfig {
  const apiKey = process.env.CINETPAY_API_KEY || 
                 (typeof window !== 'undefined' ? (window as any).VITE_CINETPAY_API_KEY : undefined) ||
                 (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CINETPAY_API_KEY : undefined);
  
  const siteId = process.env.CINETPAY_SITE_ID || 
                 (typeof window !== 'undefined' ? (window as any).VITE_CINETPAY_SITE_ID : undefined) ||
                 (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CINETPAY_SITE_ID : undefined);
  
  const notifyUrl = process.env.CINETPAY_NOTIFY_URL || 
                    (typeof window !== 'undefined' ? (window as any).VITE_CINETPAY_NOTIFY_URL : undefined) ||
                    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CINETPAY_NOTIFY_URL : undefined);
  
  const environment = (process.env.CINETPAY_ENVIRONMENT || 
                      (typeof window !== 'undefined' ? (window as any).VITE_CINETPAY_ENVIRONMENT : undefined) ||
                      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CINETPAY_ENVIRONMENT : undefined) ||
                      'production') as 'sandbox' | 'production';

  if (!apiKey || !siteId) {
    throw new Error('CinetPay credentials not found in environment variables');
  }

  return {
    apiKey,
    siteId,
    notifyUrl,
    environment
  };
} 