import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import homeEn from './home.en.json';
import homeSr from './home.sr.json';
import productEn from './product.en.json';
import productSr from './product.sr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        home: homeEn,
        product: productEn
      },
      sr: {
        home: homeSr,
        product: productSr
      }
    },
    lng: 'sr', // postavi srpski kao default
    fallbackLng: 'sr', // fallback na srpski
    interpolation: { escapeValue: false }
  });

export default i18n;