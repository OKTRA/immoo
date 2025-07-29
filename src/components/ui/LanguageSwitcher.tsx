import React from 'react';
import { Button } from './button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalizedNavigation } from '@/hooks/useLocalizedNavigation';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, getSupportedLanguages } = useTranslation();
  const { changeLanguageAndNavigate } = useLocalizedNavigation();
  const supportedLanguages = getSupportedLanguages();

  const currentLang = supportedLanguages[currentLanguage];

  const handleLanguageChange = (languageCode: string) => {
    console.log('LanguageSwitcher: Changing to language:', languageCode);
    changeLanguageAndNavigate(languageCode as any);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-white/10 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {Object.entries(supportedLanguages).map(([code, language]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === code ? 'bg-gold/10 text-gold' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
            {currentLanguage === code && (
              <span className="ml-auto text-gold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
