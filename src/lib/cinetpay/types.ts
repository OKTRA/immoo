/**
 * CinetPay TypeScript Types
 * Complete type definitions for all CinetPay API operations
 */

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  notifyUrl?: string;
  environment?: 'sandbox' | 'production';
  defaultCurrency?: string;
  defaultLanguage?: 'fr' | 'en';
}

export interface CustomerInfo {
  name: string;
  surname?: string;
  email: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipCode?: string;
}

export interface PaymentRequest {
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  customer: CustomerInfo;
  returnUrl: string;
  cancelUrl?: string;
  notifyUrl?: string;
  channels?: 'ALL' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  language?: 'fr' | 'en';
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  data?: any;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentDate?: string;
  operatorTransactionId?: string;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  cpm_trans_id: string;
  cpm_site_id: string;
  signature: string;
  cpm_amount: number;
  cpm_currency: string;
  cpm_payid: string;
  cpm_payment_date: string;
  cpm_payment_time: string;
  cpm_error_message?: string;
  cpm_result?: string;
  cpm_trans_status?: string;
  cpm_custom?: string;
  cel_phone_num?: string;
  cpm_phone_prefixe?: string;
  cpm_language?: string;
  cpm_version?: string;
  cpm_payment_config?: string;
  cpm_page_action?: string;
}

export interface CinetPayError {
  code: string;
  message: string;
  details?: any;
}

export interface TransactionVerificationResponse {
  success: boolean;
  transactionId: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  operatorTransactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
  metadata?: Record<string, any>;
  error?: string;
} 