
'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';

const translations = { en, ko, zh, ja };

export type Locale = keyof typeof translations;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'ko');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
    }
  }, [locale]);

  const activeLocale = isMounted ? locale : 'ko';

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    const currentTranslations = translations[activeLocale] || translations['ko'];
    
    let result: any = currentTranslations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [activeLocale]);
  
  const value = useMemo(() => ({ locale: activeLocale, setLocale, t }), [activeLocale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
