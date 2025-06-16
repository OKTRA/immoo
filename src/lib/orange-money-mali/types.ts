/**
 * Orange Money Mali TypeScript Types
 * Complete type definitions for all Orange Money Mali API operations
 */

export interface OrangeMoneyMaliConfig {
  clientId: string;
  clientSecret: string;
  merchantKey: string;
  environment?: 'sandbox' | 'production';
  defaultCurrency?: string;
  defaultLanguage?: 'fr' | 'en';
  apiVersion?: string;
}

export interface CustomerInfo {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  idType?: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVING_LICENCE';
  idNumber?: string;
}

export interface PaymentRequest {
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  customer: CustomerInfo;
  returnUrl?: string;
  cancelUrl?: string;
  notifyUrl?: string;
  metadata?: Record<string, any>;
  expiryTime?: number; // En minutes
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentToken?: string;
  paymentUrl?: string;
  qrCode?: string;
  ussdCode?: string;
  error?: string;
  data?: any;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  paymentMethod?: 'orange_money' | 'ussd' | 'qr';
  paymentDate?: string;
  operatorTransactionId?: string;
  fees?: number;
  metadata?: Record<string, any>;
}

export interface TransferRequest {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  amount: number;
  currency: string;
  description: string;
  transactionId: string;
  pin?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  accountStatus?: 'active' | 'suspended' | 'blocked';
  error?: string;
}

export interface WebhookPayload {
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
  customer_phone: string;
  operator_transaction_id?: string;
  payment_date: string;
  payment_time: string;
  fees?: number;
  custom_data?: string;
  signature: string;
}

export interface OrangeMoneyError {
  code: string;
  message: string;
  details?: any;
}

export interface TransactionVerificationResponse {
  success: boolean;
  transactionId: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  operatorTransactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
  fees?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface MerchantInfo {
  merchantKey: string;
  merchantName: string;
  merchantPhone: string;
  balance?: number;
  currency?: string;
} 