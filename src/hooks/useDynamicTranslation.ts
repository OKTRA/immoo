import { useMemo } from 'react';
import { useTranslation } from './useTranslation';

interface UseDynamicTranslationOptions {
  namespace?: string;
  defaultValue?: string;
  interpolation?: Record<string, any>;
}

export const useDynamicTranslation = (options: UseDynamicTranslationOptions = {}) => {
  const { t } = useTranslation();
  const { namespace, defaultValue, interpolation } = options;

  const translate = useMemo(() => {
    return (key: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const translation = t(fullKey, values || interpolation);
      
      // If translation is the same as the key, return default or key
      return translation === fullKey ? (defaultValue || key) : translation;
    };
  }, [t, namespace, defaultValue, interpolation]);

  const translateWithFallback = useMemo(() => {
    return (key: string, fallback: string, values?: Record<string, any>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const translation = t(fullKey, values || interpolation);
      
      return translation === fullKey ? fallback : translation;
    };
  }, [t, namespace, interpolation]);

  const translateArray = useMemo(() => {
    return (keys: string[], values?: Record<string, any>) => {
      return keys.map(key => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const translation = t(fullKey, values || interpolation);
        return translation === fullKey ? (defaultValue || key) : translation;
      });
    };
  }, [t, namespace, defaultValue, interpolation]);

  return {
    t: translate,
    tWithFallback: translateWithFallback,
    tArray: translateArray,
  };
};

// Specialized hooks for common namespaces
export const useAuthTranslation = () => useDynamicTranslation({ namespace: 'auth' });
export const usePropertyTranslation = () => useDynamicTranslation({ namespace: 'property' });
export const useAgencyTranslation = () => useDynamicTranslation({ namespace: 'agency' });
export const useTenantTranslation = () => useDynamicTranslation({ namespace: 'tenant' });
export const useContractTranslation = () => useDynamicTranslation({ namespace: 'contract' });
export const usePaymentTranslation = () => useDynamicTranslation({ namespace: 'payment' });
export const useSubscriptionTranslation = () => useDynamicTranslation({ namespace: 'subscription' });
export const usePricingTranslation = () => useDynamicTranslation({ namespace: 'pricing' });
export const useDocumentGeneratorTranslation = () => useDynamicTranslation({ namespace: 'documentGenerator' });
export const useFeaturesTranslation = () => useDynamicTranslation({ namespace: 'features' });
export const useFooterTranslation = () => useDynamicTranslation({ namespace: 'footer' });
export const useErrorsTranslation = () => useDynamicTranslation({ namespace: 'errors' });
export const useNotificationsTranslation = () => useDynamicTranslation({ namespace: 'notifications' }); 