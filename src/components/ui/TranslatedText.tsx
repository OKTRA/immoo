import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  i18nKey: string;
  fallback?: string;
  values?: Record<string, any>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  fallback,
  values,
  className,
  as: Component = 'span'
}) => {
  const { t } = useTranslation();
  
  const translatedText = t(i18nKey, values);
  
  // If translation is the same as the key, it means the key wasn't found
  const displayText = translatedText === i18nKey ? (fallback || i18nKey) : translatedText;
  
  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};

// Specialized components for common use cases
export const TranslatedHeading: React.FC<Omit<TranslatedTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  level = 1,
  ...props
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  return <TranslatedText {...props} as={Component} />;
};

export const TranslatedParagraph: React.FC<Omit<TranslatedTextProps, 'as'>> = (props) => {
  return <TranslatedText {...props} as="p" />;
};

export const TranslatedLabel: React.FC<Omit<TranslatedTextProps, 'as'>> = (props) => {
  return <TranslatedText {...props} as="label" />;
}; 