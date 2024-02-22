import { Language, Theme } from './enum.ts'

export enum ThemeConfig {
  CURRENT = 'Theme.Current',
  IS_SYNC_WITH_SYSTEM = 'Theme.IsSyncWithSystem',
}

export enum LanguageConfig {
  UI = 'Language.UI',
}

export type AppConfig = {
  [ThemeConfig.CURRENT]?: Theme
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]?: boolean
  [LanguageConfig.UI]?: Language
}
