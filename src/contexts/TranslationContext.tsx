import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SupportedLanguage } from '@/i18n';

interface TranslationContextType {
  t: (key: string, options?: any) => string;
  changeLanguage: (language: SupportedLanguage) => void;
  currentLanguage: SupportedLanguage;
  isRTL: () => boolean;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const translationUtils = useTranslation();

  return (
    <TranslationContext.Provider value={translationUtils}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}; 