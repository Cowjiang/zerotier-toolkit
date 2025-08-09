import { Menu } from '@tauri-apps/api/menu/menu'
import { TrayIcon } from '@tauri-apps/api/tray'
import { error } from '@tauri-apps/plugin-log'
import { exit } from '@tauri-apps/plugin-process'
import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'

import { showWindow } from '../tauriHelpers.ts'
import { MenuItem, MenuItemFactory, MenuItemOption, PredefinedMenuItem, TrayActions } from './types'

const TRAY_ID = 'TRAY'

const Factory: MenuItemFactory = {
  buildNavigateOption: (path: string, text: string): MenuItemOption => {
    return {
      id: path,
      text,
      action: async () => {
        const navigate = useNavigate()
        navigate(path)
        await showWindow()
      },
    }
  },
  buildQuitOption: (id: string, text: string): MenuItemOption => {
    return {
      id,
      text,
      action: async () => {
        await exit(0)
      },
    }
  },
  buildSeparatorOption: (): PredefinedMenuItem => {
    return {
      item: 'Separator',
    }
  },
}

function initOptions(): MenuItem[] {
  return [
    Factory.buildNavigateOption('/zerotier/networks', t('Networks')),
    Factory.buildNavigateOption('/zerotier/status', t('Status')),
    Factory.buildNavigateOption('/settings', t('Settings')),
    Factory.buildSeparatorOption(),
    Factory.buildQuitOption('quit', t('Quit ZeroTier Toolkit')),
  ]
}

export const TrayHelper: TrayActions = {
  resetMenu: async () => {
    try {
      const tray = await TrayIcon.getById(TRAY_ID)
      if (!tray) {
        return
      }
      const menu = await Menu.new({
        items: initOptions(),
      })
      await tray.setMenu(menu)
      await tray.setShowMenuOnLeftClick(false)
    } catch (e) {
      await error(`reset menu fail with:${e}`)
    }
  },
}
