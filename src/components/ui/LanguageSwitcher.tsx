import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'agency';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className 
}) => {
  const { currentLanguage } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    console.log('LanguageSwitcher: Changing to language:', newLanguage);
    changeLanguageAndNavigate(newLanguage as any);
  };

  const baseClasses = "text-xs font-medium transition-all duration-300 rounded";
  
  const variantClasses = {
    default: "px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white/80 backdrop-blur-sm border border-immoo-gray/20 shadow-sm hover:bg-white hover:shadow-md",
    agency: "w-11 h-11 flex items-center justify-center border-immoo-gray/30 text-immoo-navy hover:bg-immoo-pearl hover:border-immoo-gold bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow-md"
  };

  return (
    <button
      onClick={handleLanguageChange}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      title={currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {currentLanguage === 'fr' ? 'EN' : 'FR'}
    </button>
  );
};
