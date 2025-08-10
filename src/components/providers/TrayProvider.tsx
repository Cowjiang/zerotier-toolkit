import { Menu, MenuOptions } from '@tauri-apps/api/menu/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import { exit } from '@tauri-apps/plugin-process'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { showWindow } from '../../utils/helpers/tauriHelpers.ts'
import { useLanguage } from './LanguageProvider.tsx'

type TrayContext = {
  menuItems: MenuOptions['items']
  setTrayMenu: (items: MenuOptions['items']) => Promise<void>
}

const TrayContext = createContext<TrayContext | null>(null)

const TRAY_ID = 'TRAY'

function TrayProvider({ children }: { children: ReactNode }) {
  const defaultMenuItems: MenuOptions['items'] = [
    { id: 'networks', text: 'Networks', action: () => navigateTo('/zerotier/networks') },
    { id: 'status', text: 'Status', action: () => navigateTo('/zerotier/status') },
    { id: 'settings', text: 'Settings', action: () => navigateTo('/settings') },
    { id: 'separator', item: 'Separator' },
    { id: 'quit', text: 'Quit ZeroTier Toolkit', action: async () => await exit(0) },
  ]

  const navigate = useNavigate()
  const navigateTo = async (path: string) => {
    navigate(path)
    await showWindow()
  }

  const renderTrayMenu = async (items: MenuOptions['items']) => {
    try {
      const tray = await TrayIcon.getById(TRAY_ID)
      if (!tray) {
        return
      }
      const menu = await Menu.new({
        items,
      })
      await tray.setMenu(menu)
    } catch (e) {
      console.error('[Tray]', e)
    }
  }

  const [menuItems, setMenuItems] = useState<MenuOptions['items']>()
  const setTrayMenu = async (items: MenuOptions['items']) => {
    setMenuItems(items)
  }

  const { language } = useLanguage()
  const { t } = useTranslation()
  useEffect(() => {
    if (!menuItems) {
      setMenuItems(() => defaultMenuItems)
      return
    }
    const translatedMenuItems = menuItems.map(({ text, ...item }) => ({
      ...item,
      text: typeof text === 'string' ? t(text, { lng: language }) : text,
    })) as MenuOptions['items']
    renderTrayMenu(translatedMenuItems)
  }, [language, menuItems])

  return <TrayContext.Provider value={{ menuItems, setTrayMenu }}>{children}</TrayContext.Provider>
}

export const useTray = () => {
  const context = useContext(TrayContext)
  if (!context) {
    throw new Error('useTray must be used within a TrayProvider')
  }
  return context
}

export default TrayProvider
