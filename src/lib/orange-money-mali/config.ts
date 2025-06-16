/**
 * Orange Money Mali Configuration
 * Manage API keys and environment settings
 */

import type { OrangeMoneyMaliConfig } from './types';

export class OrangeMoneyMaliConfigManager {
  private config: OrangeMoneyMaliConfig;

  constructor(config: OrangeMoneyMaliConfig) {
    this.validateConfig(config);
    this.config = {
      environment: 'production',
      defaultCurrency: 'XOF',
      defaultLanguage: 'fr',
      apiVersion: 'v1',
      ...config
    };
  }

  private validateConfig(config: OrangeMoneyMaliConfig): void {
    if (!config.clientId || !config.clientSecret || !config.merchantKey) {
      throw new Error('Orange Money Mali Client ID, Client Secret, and Merchant Key are required');
    }
  }

  public getConfig(): OrangeMoneyMaliConfig {
    return { ...this.config };
  }

  public getApiUrl(): string {
    return this.config.environment === 'sandbox' 
      ? 'https://api.orange.com/orange-money-webpay/dev/v1'
      : 'https://api.orange.com/orange-money-webpay/ml/v1';
  }

  public getAuthUrl(): string {
    return this.config.environment === 'sandbox'
      ? 'https://api.orange.com/oauth/dev/v1/token'
      : 'https://api.orange.com/oauth/v1/token';
  }

  public updateConfig(newConfig: Partial<OrangeMoneyMaliConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig(this.config);
  }
}

// Environment-based configuration helper
export function createConfigFromEnv(): OrangeMoneyMaliConfig {
  const clientId = process.env.ORANGE_MONEY_CLIENT_ID || 
                   (typeof window !== 'undefined' ? (window as any).VITE_ORANGE_MONEY_CLIENT_ID : undefined) ||
                   (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ORANGE_MONEY_CLIENT_ID : undefined);
  
  const clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET || 
                       (typeof window !== 'undefined' ? (window as any).VITE_ORANGE_MONEY_CLIENT_SECRET : undefined) ||
                       (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ORANGE_MONEY_CLIENT_SECRET : undefined);
  
  const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY || 
                      (typeof window !== 'undefined' ? (window as any).VITE_ORANGE_MONEY_MERCHANT_KEY : undefined) ||
                      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ORANGE_MONEY_MERCHANT_KEY : undefined);
  
  const environment = (process.env.ORANGE_MONEY_ENVIRONMENT || 
                      (typeof window !== 'undefined' ? (window as any).VITE_ORANGE_MONEY_ENVIRONMENT : undefined) ||
                      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ORANGE_MONEY_ENVIRONMENT : undefined) ||
                      'production') as 'sandbox' | 'production';

  if (!clientId || !clientSecret || !merchantKey) {
    throw new Error('Orange Money Mali credentials not found in environment variables');
  }

  return {
    clientId,
    clientSecret,
    merchantKey,
    environment
  };
} 