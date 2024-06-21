import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { ThemeProviderProps, UseThemeProps } from 'next-themes/dist/types'
import { ReactElement, useEffect, useMemo } from 'react'

import { useAppStore } from '../../store/app.ts'
import { StrBool, ThemeConfig } from '../../typings/config.ts'
import { Theme } from '../../typings/enum.ts'

type ContentProps = { children: ReactElement }

function Content({ children }: ContentProps) {
  const { theme, setTheme } = useTheme() as { theme: Theme } & UseThemeProps
  const { config, setConfig, hasHydrated } = useAppStore()

  useEffect(() => {
    hasHydrated && setConfig({ [ThemeConfig.CURRENT]: theme })
  }, [theme])

  useEffect(() => {
    if (config[ThemeConfig.IS_SYNC_WITH_SYSTEM] === StrBool.TRUE) {
      const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT
      setTheme(theme)
    }
  }, [config[ThemeConfig.IS_SYNC_WITH_SYSTEM], theme])

  const handleSystemThemeChange = useMemo(
    () =>
      ({ matches }: MediaQueryListEvent) => {
        config[ThemeConfig.IS_SYNC_WITH_SYSTEM] && setTheme(matches ? Theme.DARK : Theme.LIGHT)
      },
    [config[ThemeConfig.IS_SYNC_WITH_SYSTEM]],
  )

  useEffect(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
    return () =>
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChange)
  }, [config])

  return children
}

const ThemeProvider = ({ children, ...props }: ThemeProviderProps & ContentProps) => (
  <NextThemesProvider attribute="class" defaultTheme="light" {...props}>
    <Content>{children}</Content>
  </NextThemesProvider>
)

export default ThemeProvider
