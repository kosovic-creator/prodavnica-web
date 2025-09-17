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
import loginEn from './login.en.json';
import loginSr from './login.sr.json';
import adminEn from './admin.en.json';
import adminSr from './admin.sr.json';
import cardEn from './cart.en.json';
import cardSr from './cart.sr.json';
import paymentEn from './payment.en.json';
import paymentSr from './payment.sr.json';
import registerEn from './register.en.json';
import registerSr from './register.sr.json';
import NotFoundEn from './notFound.en.json';
import NotFoundSr from './notFound.sr.json';
import navigatinEn from './navigation.en.json';
import navigationSr from './navigation.sr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        home: homeEn,
        product: productEn,
        side: sideEn,
        orders: ordersEn,
        profile: profileEn,
        login: loginEn,
        admin: adminEn,
        cart: cardEn,
        payment: paymentEn,
        register: registerEn,
        notFound: NotFoundEn,
        navigation: navigatinEn
      },
      sr: {
        home: homeSr,
        product: productSr,
        side: sideSr,
        orders: ordersSr,
        profile: profileSr,
        login: loginSr,
        admin: adminSr,
        cart: cardSr,
        payment: paymentSr,
        register: registerSr,
        notFound: NotFoundSr,
        navigation: navigationSr
      }
    },
    lng: 'sr', // postavi srpski kao default
    fallbackLng: 'sr', // fallback na srpski
    interpolation: { escapeValue: false }
  });

export default i18n;