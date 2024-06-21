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
export enum StrBool {
  TRUE = 'true',
  FALSE = 'false',
}
export const toStrBool = (value: boolean) => {
  return value ? StrBool.TRUE : StrBool.FALSE
}

export type AppConfig = {
  [ThemeConfig.CURRENT]?: Theme
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]?: StrBool
  [LanguageConfig.UI]?: Language
  [GeneralConfig.AUTO_START]?: boolean
  [GeneralConfig.ENABLE_TRAY]?: boolean
  [GeneralConfig.MINIMIZE_TO_TRAY]?: boolean
}
