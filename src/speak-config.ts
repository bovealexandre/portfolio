import { $ } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import {
  LoadTranslationFn,
  SpeakConfig,
  TranslationFn
} from 'qwik-speak';

export const config: SpeakConfig = {
  defaultLocale: { lang: 'fr-FR', currency: 'EUR', timeZone: 'Europe/Brussels' },
  supportedLocales: [
    { lang: 'fr-FR', currency: 'EUR', timeZone: 'Europe/Brussels' },
    { lang: 'it-IT', currency: 'EUR', timeZone: 'Europe/Rome' },
    { lang: 'en-EN', currency: 'USD', timeZone: 'America/Los_Angeles' },
    { lang: 'sp-SP', currency: 'EUR', timeZone: 'Europe/Madrid' },
    { lang: 'nl-NL', currency: 'EUR', timeZone: 'Europe/Brussels' },
  ],
  assets: [
    'app'
  ]
};

export const loadTranslation$: LoadTranslationFn = $(async (lang: string, asset: string, origin?: string) => {
  let url = '';
  // Absolute urls on server
  if (isServer && origin) {
    url = origin;
  }
  url += `/i18n/${lang}/${asset}.json`;
  const data = await fetch(url);
  return data.json();
});

export const translationFn: TranslationFn = {
  loadTranslation$: loadTranslation$
};
