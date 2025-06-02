import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import es from './lang/es.json'
import pt from './lang/pt.json'
import appConfig from '@/configs/app.config'
import type { Locale } from 'dayjs/locale/*'

const resources = {
    en: {
        translation: en,
    },
    es: {
        translation: es,
    },
    pt: {
        translation: pt,
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: appConfig.locale,
    lng: appConfig.locale,
    interpolation: {
        escapeValue: false,
    },
})

export const dateLocales: {
    [key: string]: () => Promise<Locale>
} = {
    en: () => import('dayjs/locale/en'),
    es: () => import('dayjs/locale/es'),
    pt: () => import('dayjs/locale/pt'),
}

export default i18n
