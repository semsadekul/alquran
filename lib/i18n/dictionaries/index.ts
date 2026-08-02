// Dictionary loader — returns the correct messages for the given locale.
// Used by react-intl's <IntlProvider>.

import type { MessageDescriptor } from 'react-intl';
import { enMessages } from './en';
import { bnMessages } from './bn';
import { arMessages } from './ar';

export type SupportedLocale = 'en' | 'bn' | 'ar';

type Messages = Record<string, string | MessageDescriptor | any>;

const dictionaries: Record<SupportedLocale, Messages> = {
  en: enMessages,
  bn: bnMessages,
  ar: arMessages,
};

/**
 * Get all messages for the given locale.
 * Falls back to English for any missing keys.
 */
export function getMessages(locale: SupportedLocale): Messages {
  return dictionaries[locale];
}

/** Check if a locale is supported */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in dictionaries;
}
