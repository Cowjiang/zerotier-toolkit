import { createContext, ReactNode, useContext, useEffect } from 'react'
import { Language } from '../../typings/enum.ts'
import i18n from 'i18next'
import { useAppStore } from '../../store/app.ts'
import { LanguageConfig } from '../../typings/config.ts'

type LanguageContext = {
  language?: Language
  setLanguage: (language: Language) => Promise<void>
}

const LanguageContext = createContext<LanguageContext | null>(null)

function LanguageProvider({ children }: { children: ReactNode }) {
  const { config, setConfig } = useAppStore()
  useEffect(() => {
    if (config[LanguageConfig.UI] && i18n.language !== config[LanguageConfig.UI]) {
      setLanguage(config[LanguageConfig.UI])
    }
  }, [config[LanguageConfig.UI]])

  const setLanguage = async (language: Language) => {
    try {
      await i18n.changeLanguage(language)
      setConfig({ [LanguageConfig.UI]: language })
    } catch (error) {
      console.error('[i18n]', error)
    }
  }

  return (
    <LanguageContext.Provider value={{ language: config[LanguageConfig.UI], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageProvider
