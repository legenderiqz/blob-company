import tr from '../data/languages/tr.js';
import en from '../data/languages/en.js';
import { gs } from './state.js';

export const languages = { tr, en };

export function setLanguage(lang) {
  gs.currentLang = lang;
}

export function t(key) {
  return key
    .split('.')
    .reduce((obj, part) => obj?.[part], languages[gs.currentLang])
    ?? key;
}

export function detectUserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || '';
  const isTurkishLocale = /^tr-TR(?:-|$)/i.test(browserLang);
  const isInTurkey =
    Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Istanbul';

  return isTurkishLocale || isInTurkey ? 'tr' : 'en';
}

export function getInitialLanguage() {
  const saved = localStorage.getItem('preferred-language');
  if (saved && Object.keys(languages).includes(saved)) {
    return saved;
  }
  return detectUserLanguage();
}