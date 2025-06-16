/**
 * Orange Money Mali Client
 * Main client class for handling all Orange Money Mali operations
 */

import type { 
  OrangeMoneyMaliConfig, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  WebhookPayload,
  TransactionVerificationResponse,
  AuthToken,
  BalanceResponse,
  TransferRequest
} from './types';
import { OrangeMoneyMaliConfigManager } from './config';
import { 
  validateWebhookSignature, 
  generateTransactionId,
  formatMaliPhoneNumber,
  validateMaliPhoneNumber,
  formatAmount,
  generateUssdCode,
  generateQRCodeData,
  isTokenExpired,
  calculateTokenExpiration
} from './utils';

export default class OrangeMoneyMaliClient {
  private configManager: OrangeMoneyMaliConfigManager;
  private authToken: AuthToken | null = null;

  constructor(config: OrangeMoneyMaliConfig) {
    this.configManager = new OrangeMoneyMaliConfigManager(config);
  }

  /**
   * Authenticate with Orange Money API
   */
  private async authenticate(): Promise<AuthToken> {
    if (this.authToken && !isTokenExpired(this.authToken)) {
      return this.authToken;
    }

    try {
      const config = this.configManager.getConfig();
      const authUrl = this.configManager.getAuthUrl();

      const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error_description || 'Authentication failed');
      }

      this.authToken = {
        access_token: result.access_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        expires_at: calculateTokenExpiration(result.expires_in)
      };

      return this.authToken;
    } catch (error) {
      console.error('Orange Money authentication error:', error);
      throw error;
    }
  }

  /**
   * Create a payment request
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate phone number
      if (!validateMaliPhoneNumber(paymentRequest.customer.phoneNumber)) {
        return {
          success: false,
          error: 'Invalid Mali phone number format'
        };
      }

      // Validate amount
      if (!Number.isInteger(paymentRequest.amount) || paymentRequest.amount < 100) {
        return {
          success: false,
          error: 'Amount must be an integer and at least 100 FCFA'
        };
      }

      const token = await this.authenticate();
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      const formattedPhone = formatMaliPhoneNumber(paymentRequest.customer.phoneNumber);

      const requestData = {
        merchant_key: config.merchantKey,
        currency: paymentRequest.currency,
        order_id: paymentRequest.transactionId,
        amount: formatAmount(paymentRequest.amount),
        return_url: paymentRequest.returnUrl || '',
        cancel_url: paymentRequest.cancelUrl || '',
        notif_url: paymentRequest.notifyUrl || '',
        lang: config.defaultLanguage || 'fr',
        reference: paymentRequest.description,
        customer_phone: formattedPhone,
        customer_first_name: paymentRequest.customer.firstName,
        customer_last_name: paymentRequest.customer.lastName,
        customer_email: paymentRequest.customer.email || '',
        custom_data: paymentRequest.metadata ? JSON.stringify(paymentRequest.metadata) : ''
      };

      console.log('Orange Money Payment Request:', {
        order_id: requestData.order_id,
        amount: requestData.amount,
        currency: requestData.currency,
        customer_phone: requestData.customer_phone
      });

      const response = await fetch(`${apiUrl}/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Orange Money API Error:', result);
        return {
          success: false,
          error: result.error_description || result.message || 'Payment creation failed'
        };
      }

      // Generate USSD code and QR code
      const ussdCode = generateUssdCode(paymentRequest.amount, config.merchantKey);
      const qrCode = generateQRCodeData(config.merchantKey, paymentRequest.amount, paymentRequest.transactionId);

      return {
        success: true,
        transactionId: paymentRequest.transactionId,
        paymentToken: result.payment_token,
        paymentUrl: result.payment_url,
        ussdCode,
        qrCode,
        data: result
      };

    } catch (error) {
      console.error('Orange Money Client Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Verify a transaction status
   */
  async verifyTransaction(transactionId: string): Promise<TransactionVerificationResponse> {
    try {
      const token = await this.authenticate();
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      const response = await fetch(`${apiUrl}/transactionstatus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_key: config.merchantKey,
          order_id: transactionId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          transactionId,
          status: 'failed',
          amount: 0,
          currency: '',
          error: result.error_description || 'Transaction verification failed'
        };
      }

      const status = this.mapOrangeMoneyStatus(result.status);
      
      return {
        success: true,
        transactionId,
        status,
        amount: result.amount || 0,
        currency: result.currency || 'XOF',
        operatorTransactionId: result.operator_transaction_id,
        paymentMethod: 'orange_money',
        paymentDate: result.payment_date,
        fees: result.fees,
        metadata: result.custom_data ? JSON.parse(result.custom_data) : undefined
      };

    } catch (error) {
      console.error('Transaction verification error:', error);
      return {
        success: false,
        transactionId,
        status: 'failed',
        amount: 0,
        currency: '',
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Handle webhook notification
   */
  async handleWebhook(payload: WebhookPayload): Promise<PaymentStatus | null> {
    try {
      const config = this.configManager.getConfig();
      
      // Validate webhook signature
      const isValid = validateWebhookSignature(payload, config.clientSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return null;
      }

      const status = this.mapOrangeMoneyStatus(payload.status);
      
      return {
        transactionId: payload.transaction_id,
        status,
        amount: payload.amount,
        currency: payload.currency,
        paymentMethod: 'orange_money',
        paymentDate: `${payload.payment_date} ${payload.payment_time}`,
        operatorTransactionId: payload.operator_transaction_id,
        fees: payload.fees,
        metadata: payload.custom_data ? JSON.parse(payload.custom_data) : undefined
      };

    } catch (error) {
      console.error('Webhook handling error:', error);
      return null;
    }
  }

  /**
   * Check account balance
   */
  async getBalance(): Promise<BalanceResponse> {
    try {
      const token = await this.authenticate();
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      const response = await fetch(`${apiUrl}/balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_key: config.merchantKey
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error_description || 'Balance check failed'
        };
      }

      return {
        success: true,
        balance: result.balance,
        currency: result.currency || 'XOF',
        accountStatus: result.account_status
      };

    } catch (error) {
      console.error('Balance check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Balance check failed'
      };
    }
  }

  /**
   * Transfer money between accounts
   */
  async transferMoney(transferRequest: TransferRequest): Promise<PaymentResponse> {
    try {
      // Validate phone numbers
      if (!validateMaliPhoneNumber(transferRequest.senderPhoneNumber) ||
          !validateMaliPhoneNumber(transferRequest.receiverPhoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      const token = await this.authenticate();
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      const requestData = {
        merchant_key: config.merchantKey,
        currency: transferRequest.currency,
        order_id: transferRequest.transactionId,
        amount: formatAmount(transferRequest.amount),
        sender_phone: formatMaliPhoneNumber(transferRequest.senderPhoneNumber),
        receiver_phone: formatMaliPhoneNumber(transferRequest.receiverPhoneNumber),
        description: transferRequest.description,
        sender_pin: transferRequest.pin
      };

      const response = await fetch(`${apiUrl}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error_description || 'Transfer failed'
        };
      }

      return {
        success: true,
        transactionId: transferRequest.transactionId,
        data: result
      };

    } catch (error) {
      console.error('Transfer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  /**
   * Generate a unique transaction ID
   */
  generateTransactionId(prefix?: string): string {
    return generateTransactionId(prefix);
  }

  /**
   * Get payment status from transaction ID
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    const verification = await this.verifyTransaction(transactionId);
    
    if (!verification.success) {
      return null;
    }

    return {
      transactionId: verification.transactionId,
      status: verification.status,
      amount: verification.amount,
      currency: verification.currency,
      paymentMethod: verification.paymentMethod,
      paymentDate: verification.paymentDate,
      operatorTransactionId: verification.operatorTransactionId,
      fees: verification.fees,
      metadata: verification.metadata
    };
  }

  /**
   * Map Orange Money status to our status format
   */
  private mapOrangeMoneyStatus(orangeMoneyStatus?: string): PaymentStatus['status'] {
    switch (orangeMoneyStatus?.toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
      case 'FAILURE':
        return 'failed';
      case 'CANCELLED':
      case 'CANCELED':
        return 'cancelled';
      case 'EXPIRED':
        return 'expired';
      default:
        return 'pending';
    }
  }
} 