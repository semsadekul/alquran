'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { getMessages, isSupportedLocale } from '@/lib/i18n/dictionaries';

type Locale = 'en' | 'bn' | 'ar';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
});

const LOCALES: Record<Locale, { name: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', dir: 'ltr' },
  bn: { name: 'বাংলা', dir: 'ltr' },
  ar: { name: 'العربية', dir: 'rtl' },
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('alquran_locale') as Locale | null;
    if (stored && stored in LOCALES) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('alquran_locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = LOCALES[newLocale].dir;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={getMessages(locale)} timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  return context;
}

export { LOCALES };
