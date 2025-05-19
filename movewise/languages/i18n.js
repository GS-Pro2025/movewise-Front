import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import es from './es.json';

const getLanguageConfig = () => {
  try {
    const locale = Localization.locale || 'es';
    const [language] = locale.split(/[-_]/);
    return {
      lng: language,
      fallbackLng: 'es',
      supportedLngs: ['en', 'es']
    };
  } catch (error) {
    console.error('Error detecting locale:', error);
    return {
      lng: 'es',
      fallbackLng: 'es',
      supportedLngs: ['en', 'es']
    };
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    compatibilityJSON: 'v3',
    ...getLanguageConfig(),
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Opcional: Actualizar idioma dinámicamente
const updateLanguage = async () => {
  const { locale } = await Localization.getLocalizationAsync();
  i18n.changeLanguage(locale.split(/[-_]/)[0]);
};

import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const updateLanguage = async () => {
    const { locale } = await Localization.getLocalizationAsync();
    i18n.changeLanguage(locale.split(/[-_]/)[0]);
  };

  // Actualización inicial
  updateLanguage();
}

export default i18n;