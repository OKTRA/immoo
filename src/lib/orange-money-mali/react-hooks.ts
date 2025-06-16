/**
 * React Hooks for Orange Money Mali (Optional)
 * If you're using React, these hooks make integration easier
 */

import { useState, useCallback, useEffect } from 'react';
import OrangeMoneyMaliClient from './client';
import type { OrangeMoneyMaliConfig, PaymentRequest, PaymentResponse, PaymentStatus } from './types';

export interface UseOrangeMoneyMaliReturn {
  client: OrangeMoneyMaliClient | null;
  isLoading: boolean;
  error: string | null;
  createPayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  verifyTransaction: (transactionId: string) => Promise<PaymentStatus | null>;
  getBalance: () => Promise<any>;
  clearError: () => void;
}

/**
 * React hook for Orange Money Mali integration
 */
export function useOrangeMoneyMali(config: OrangeMoneyMaliConfig): UseOrangeMoneyMaliReturn {
  const [client] = useState(() => new OrangeMoneyMaliClient(config));
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

  const getBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await client.getBalance();
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
    getBalance,
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
    const transactionId = urlParams.get('transaction_id') || urlParams.get('order_id');
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
 * Hook for simplified Orange Money payment flow
 */
export function useSimpleOrangeMoneyPayment(config: OrangeMoneyMaliConfig) {
  const { client, isLoading, error, createPayment, clearError } = useOrangeMoneyMali(config);

  const pay = useCallback(async (
    amount: number,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    description: string,
    options?: {
      email?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    if (!client) return null;

    const transactionId = client.generateTransactionId();
    
    const paymentRequest: PaymentRequest = {
      transactionId,
      amount,
      currency: 'XOF',
      description,
      customer: {
        phoneNumber,
        firstName,
        lastName,
        email: options?.email
      },
      returnUrl: `${window.location.origin}/payment-success?transaction_id=${transactionId}`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
      metadata: options?.metadata
    };

    const response = await createPayment(paymentRequest);
    
    return response;
  }, [client, createPayment]);

  const payWithUSSD = useCallback(async (
    amount: number,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    description: string
  ) => {
    const response = await pay(amount, phoneNumber, firstName, lastName, description);
    
    if (response?.success && response.ussdCode) {
      // Show USSD code to user
      console.log('Composez ce code USSD:', response.ussdCode);
    }
    
    return response;
  }, [pay]);

  return {
    pay,
    payWithUSSD,
    isLoading,
    error,
    clearError
  };
}

/**
 * Hook for Orange Money balance checking
 */
export function useOrangeMoneyBalance(config: OrangeMoneyMaliConfig) {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('XOF');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new OrangeMoneyMaliClient(config);

  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await client.getBalance();
      
      if (result.success) {
        setBalance(result.balance || null);
        setCurrency(result.currency || 'XOF');
      } else {
        setError(result.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return {
    balance,
    currency,
    isLoading,
    error,
    fetchBalance,
    refresh: fetchBalance
  };
} 