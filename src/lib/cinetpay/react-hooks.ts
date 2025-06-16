/**
 * React Hooks for CinetPay (Optional)
 * If you're using React, these hooks make integration easier
 */

import { useState, useCallback, useEffect } from 'react';
import CinetPayClient from './client';
import type { CinetPayConfig, PaymentRequest, PaymentResponse, PaymentStatus } from './types';

export interface UseCinetPayReturn {
  client: CinetPayClient | null;
  isLoading: boolean;
  error: string | null;
  createPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  verifyTransaction: (transactionId: string) => Promise<PaymentStatus | null>;
  clearError: () => void;
}

/**
 * React hook for CinetPay integration
 */
export function useCinetPay(config: CinetPayConfig): UseCinetPayReturn {
  const [client] = useState(() => new CinetPayClient(config));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (request: PaymentRequest): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await client.createPayment(request);
      if (!response.success && response.error) {
        setError(response.error);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const verifyTransaction = useCallback(async (transactionId: string): Promise<PaymentStatus | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await client.getPaymentStatus(transactionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    client,
    isLoading,
    error,
    createPayment,
    verifyTransaction,
    clearError
  };
}

/**
 * Hook for handling payment redirects (useful for return URLs)
 */
export function usePaymentReturn() {
  const [paymentResult, setPaymentResult] = useState<{
    transactionId: string | null;
    status: 'success' | 'cancelled' | 'error' | null;
  }>({ transactionId: null, status: null });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transaction_id');
    const cancelled = urlParams.get('cancel');
    const error = urlParams.get('error');

    if (transactionId) {
      setPaymentResult({
        transactionId,
        status: cancelled ? 'cancelled' : error ? 'error' : 'success'
      });
    }
  }, []);

  return paymentResult;
}

/**
 * Hook for simplified payment flow
 */
export function useSimplePayment(config: CinetPayConfig) {
  const { client, isLoading, error, createPayment, clearError } = useCinetPay(config);

  const pay = useCallback(async (
    amount: number,
    currency: string,
    description: string,
    customer: PaymentRequest['customer'],
    options?: {
      channels?: PaymentRequest['channels'];
      metadata?: Record<string, any>;
    }
  ) => {
    if (!client) return null;

    const transactionId = client.generateTransactionId();
    
    const paymentRequest: PaymentRequest = {
      transactionId,
      amount,
      currency,
      description,
      customer,
      returnUrl: `${window.location.origin}/payment-success?transaction_id=${transactionId}`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
      channels: options?.channels || 'ALL',
      metadata: options?.metadata
    };

    const response = await createPayment(paymentRequest);
    
    if (response.success && response.paymentUrl) {
      window.location.href = response.paymentUrl;
    }
    
    return response;
  }, [client, createPayment]);

  return {
    pay,
    isLoading,
    error,
    clearError
  };
} 