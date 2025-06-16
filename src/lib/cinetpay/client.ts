/**
 * CinetPay Client
 * Main client class for handling all CinetPay operations
 */

import type { 
  CinetPayConfig, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus,
  WebhookPayload,
  TransactionVerificationResponse,
  CinetPayError
} from './types';
import { CinetPayConfigManager } from './config';
import { generateSignature, validateWebhookSignature, generateTransactionId } from './utils';

export default class CinetPayClient {
  private configManager: CinetPayConfigManager;

  constructor(config: CinetPayConfig) {
    this.configManager = new CinetPayConfigManager(config);
  }

  /**
   * Create a payment request and get redirect URL
   */
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      // Prepare customer data
      const customerData = this.prepareCustomerData(paymentRequest.customer);
      
      const requestData = {
        apikey: config.apiKey,
        site_id: config.siteId,
        transaction_id: paymentRequest.transactionId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        description: paymentRequest.description,
        ...customerData,
        notify_url: paymentRequest.notifyUrl || config.notifyUrl,
        return_url: paymentRequest.returnUrl,
        cancel_url: paymentRequest.cancelUrl || paymentRequest.returnUrl,
        channels: paymentRequest.channels || 'ALL',
        lang: paymentRequest.language || config.defaultLanguage || 'fr',
        metadata: paymentRequest.metadata ? JSON.stringify(paymentRequest.metadata) : undefined
      };

      console.log('CinetPay Payment Request:', {
        transaction_id: requestData.transaction_id,
        amount: requestData.amount,
        currency: requestData.currency
      });

      const response = await fetch(`${apiUrl}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok || !result.data?.payment_url) {
        console.error('CinetPay API Error:', result);
        return {
          success: false,
          error: result.message || 'Failed to create payment'
        };
      }

      return {
        success: true,
        paymentUrl: result.data.payment_url,
        transactionId: paymentRequest.transactionId,
        data: result.data
      };

    } catch (error) {
      console.error('CinetPay Client Error:', error);
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
      const config = this.configManager.getConfig();
      const apiUrl = this.configManager.getApiUrl();

      const requestData = {
        apikey: config.apiKey,
        site_id: config.siteId,
        transaction_id: transactionId
      };

      const response = await fetch(`${apiUrl}/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          transactionId,
          status: 'failed',
          amount: 0,
          currency: '',
          error: result.message || 'Transaction verification failed'
        };
      }

      const status = this.mapCinetPayStatus(result.data?.payment_status);
      
      return {
        success: true,
        transactionId,
        status,
        amount: result.data?.amount || 0,
        currency: result.data?.currency || '',
        operatorTransactionId: result.data?.operator_transaction_id,
        paymentMethod: result.data?.payment_method,
        paymentDate: result.data?.payment_date,
        metadata: result.data?.metadata ? JSON.parse(result.data.metadata) : undefined
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
      const isValid = validateWebhookSignature(payload, config.apiKey);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return null;
      }

      const status = this.mapCinetPayStatus(payload.cpm_trans_status);
      
      return {
        transactionId: payload.cpm_trans_id,
        status,
        amount: payload.cpm_amount,
        currency: payload.cpm_currency,
        paymentMethod: payload.cpm_payment_config,
        paymentDate: `${payload.cpm_payment_date} ${payload.cpm_payment_time}`,
        operatorTransactionId: payload.cpm_payid,
        metadata: payload.cpm_custom ? JSON.parse(payload.cpm_custom) : undefined
      };

    } catch (error) {
      console.error('Webhook handling error:', error);
      return null;
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
      metadata: verification.metadata
    };
  }

  /**
   * Prepare customer data for CinetPay API
   */
  private prepareCustomerData(customer: PaymentRequest['customer']) {
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = customer.surname || nameParts.slice(1).join(' ') || 'User';

    return {
      customer_name: firstName,
      customer_surname: lastName,
      customer_email: customer.email,
      customer_phone_number: customer.phoneNumber,
      customer_address: customer.address || 'N/A',
      customer_city: customer.city || 'N/A',
      customer_country: customer.country || 'CI',
      customer_state: customer.state || 'CI',
      customer_zip_code: customer.zipCode || '00000'
    };
  }

  /**
   * Map CinetPay status to our status format
   */
  private mapCinetPayStatus(cinetPayStatus?: string): PaymentStatus['status'] {
    switch (cinetPayStatus) {
      case 'ACCEPTED':
      case 'SUCCESS':
        return 'completed';
      case 'REFUSED':
      case 'FAILED':
        return 'failed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
} 