import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import es from './es.json';


console.log(Localization.locale); // ej. "es-CO" o "en-US"
console.log(Localization.timezone); // ej. "America/Bogota"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: Localization.locale.split('-')[0], // "es" o "en"
    fallbackLng: Localization.locale.split('-')[0], // "es" o "en"
    interpolation:{
      escapeValue: false
    }
  });

export default i18n;
