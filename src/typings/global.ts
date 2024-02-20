import { Theme } from './enum.ts'

export type InvokeResponse = {
  code: number
  message?: string
  data: any
}

type ThemeConfig = {
  current?: Theme
  isSyncWithSystem?: boolean
}

export type AppConfig = {
  theme?: ThemeConfig
}
