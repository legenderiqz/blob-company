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
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0];
  return Object.keys(languages).includes(langCode) ? langCode : 'en';
}

export function getInitialLanguage() {
  const saved = localStorage.getItem('preferred-language');
  if (saved && Object.keys(languages).includes(saved)) {
    return saved;
  }
  return detectUserLanguage();
}