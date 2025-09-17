import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import homeEn from './home.en.json';
import homeSr from './home.sr.json';
import productEn from './product.en.json';
import productSr from './product.sr.json';
import sideEn from './side.en.json';
import sideSr from './side.sr.json';
import ordersSr from './orders.sr.json';
import ordersEn from './orders.en.json';
import profileSr from './profile.sr.json';
import profileEn from './profile.en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        home: homeEn,
        product: productEn,
        side: sideEn,
        orders: ordersEn,
        profile: profileEn
      },
      sr: {
        home: homeSr,
        product: productSr,
        side: sideSr,
        orders: ordersSr,
        profile: profileSr
      }
    },
    lng: 'sr', // postavi srpski kao default
    fallbackLng: 'sr', // fallback na srpski
    interpolation: { escapeValue: false }
  });

export default i18n;