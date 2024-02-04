import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import resources from './resources'

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh_CN',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})

export default i18n
