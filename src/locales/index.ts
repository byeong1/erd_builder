import { createI18n } from 'vue-i18n'
import ko from './ko'
import en from './en'

export const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'en',
  messages: {
    ko,
    en
  }
})

export default i18n
