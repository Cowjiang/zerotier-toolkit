import { Language, Theme } from './enum.ts'

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

export type AppConfig = {
  [ThemeConfig.CURRENT]?: Theme
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]?: boolean
  [LanguageConfig.UI]?: Language
  [GeneralConfig.AUTO_START]?: boolean
  [GeneralConfig.ENABLE_TRAY]?: boolean
  [GeneralConfig.MINIMIZE_TO_TRAY]?: boolean
}
