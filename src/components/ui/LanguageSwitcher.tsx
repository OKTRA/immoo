import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    console.log('LanguageSwitcher: Changing to language:', newLanguage);
    changeLanguageAndNavigate(newLanguage as any);
  };

  return (
    <button
      onClick={handleLanguageChange}
      className="text-xs font-medium transition-colors duration-200 px-2 py-1 rounded
        text-gray-600 hover:text-gray-900 hover:bg-gray-100
        md:text-gray-600 md:hover:text-gray-900 md:hover:bg-gray-100
        bg-white/80 backdrop-blur-sm border border-immoo-gray/20 shadow-sm hover:bg-white hover:shadow-md"
      title={currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {currentLanguage === 'fr' ? 'EN' : 'FR'}
    </button>
  );
};
