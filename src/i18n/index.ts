import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

const resources = {
  fr: {
    translation: frTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// Function to get browser language and map to supported languages
const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'fr';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Map browser language to supported languages
  if (langCode === 'en') {
    return 'en';
  }
  // Default to French for all other languages
  return 'fr';
};

// Get initial language from localStorage or browser
const getInitialLanguage = (): SupportedLanguage => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
    return savedLang as SupportedLanguage;
  }
  return getBrowserLanguage();
};

const initialLanguage = getInitialLanguage();

console.log('🌍 i18n Initialization:', {
  initialLanguage,
  browserLanguage: navigator.language,
  savedLanguage: localStorage.getItem('i18nextLng'),
  fallbackLanguage: 'fr'
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    lng: initialLanguage, // Set initial language
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      // Custom detection function
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      lookupFromUrlIndex: 0,
      lookupFromUrlPath: 0,
      lookupFromUrlSearch: 0,
      lookupFromUrlHash: 0,
    },

    // Language detection options
    load: 'languageOnly',
    
    // Pluralization
    pluralSeparator: '_',
    
    // Context
    contextSeparator: '_',
    
    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
  });

// Set document direction based on language
const setDocumentDirection = (language: string) => {
  const lang = SUPPORTED_LANGUAGES[language as SupportedLanguage];
  if (lang) {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = language;
  }
};

// Initialize document direction
setDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  console.log('🌍 Language changed to:', lng);
  setDocumentDirection(lng);
});

// Listen for initialization
i18n.on('initialized', (options) => {
  console.log('🌍 i18n initialized with:', {
    language: i18n.language,
    resolvedLanguage: i18n.resolvedLanguage,
    options
  });
});

export default i18n;
