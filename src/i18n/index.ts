import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { Language } from '../typings/enum.ts'
import zh_CN from './resources/zh_CN.json'

export const resources = {
  [Language.en_US]: {},
  [Language.zh_CN]: {
    translation: zh_CN,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: Language.en_US,
  fallbackLng: Language.en_US,
})
