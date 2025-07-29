import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');

  // Update current language when i18n language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language as SupportedLanguage);
  }, [i18n.language]);

  const changeLanguage = useCallback((language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
  }, [i18n]);

  const getCurrentLanguage = useCallback(() => {
    return i18n.language as SupportedLanguage;
  }, [i18n.language]);

  const isRTL = useCallback(() => {
    return i18n.dir() === 'rtl';
  }, [i18n]);

  const getSupportedLanguages = useCallback(() => {
    return SUPPORTED_LANGUAGES;
  }, []);

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(value);
  }, [i18n.language]);

  const formatCurrency = useCallback((value: number, currency = 'XOF') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, [i18n.language]);

  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  }, [i18n.language]);

  const formatRelativeTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return t('common.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('common.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('common.hoursAgo', { count: hours });
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('common.daysAgo', { count: days });
    } else {
      return formatDate(dateObj, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }, [i18n.language, t]);

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    getSupportedLanguages,
    currentLanguage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    i18n
  };
};
