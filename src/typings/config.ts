import { Language, Theme } from './enum.ts'
import { Network } from './zerotier.ts'

export enum ConfigType {
  APP = 'system',
  ZEROTIER = 'zerotier',
}

export enum ThemeConfig {
  CURRENT = 'Theme.Current',
  IS_SYNC_WITH_SYSTEM = 'Theme.IsSyncWithSystem',
}

export enum LanguageConfig {
  UI = 'Language.UI',
}

export enum GeneralConfig {
  AUTO_START = 'General.AutoStart',
  ENABLE_TRAY = 'General.EnableTray',
  MINIMIZE_TO_TRAY = 'General.MinimizeToTray',
}

export enum ZerotierConfig {
  TOKEN = 'Zerotier.Token',
  PORT = 'Zerotier.Port',
  NETWORKS = 'Zerotier.Networks',
}

export type AppConfig = {
  [ThemeConfig.CURRENT]?: Theme
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]?: boolean
  [LanguageConfig.UI]?: Language
  [GeneralConfig.AUTO_START]?: boolean
  [GeneralConfig.ENABLE_TRAY]?: boolean
  [GeneralConfig.MINIMIZE_TO_TRAY]?: boolean
}

export type ZeroTierConfig = {
  [ZerotierConfig.TOKEN]?: string
  [ZerotierConfig.PORT]?: number
  [ZerotierConfig.NETWORKS]?: Network[]
}
