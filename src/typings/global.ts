import { Theme, ThemeConfig } from './enum.ts'

export type InvokeResponse = {
  code: number
  message?: string
  data: any
}

export type AppConfig = {
  [ThemeConfig.CURRENT]?: Theme
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]?: boolean
}
