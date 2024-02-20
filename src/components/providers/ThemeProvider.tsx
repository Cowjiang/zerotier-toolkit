import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { ThemeProviderProps, UseThemeProps } from 'next-themes/dist/types'
import { ReactElement, useEffect, useMemo } from 'react'

import { useAppStore } from '../../store/app.ts'
import { Theme } from '../../typings/enum.ts'

type ContentProps = { children: ReactElement }

function Content({ children }: ContentProps) {
  const { theme, setTheme } = useTheme() as { theme: Theme } & UseThemeProps
  const { config, setConfig, hasHydrated } = useAppStore()

  useEffect(() => {
    hasHydrated && setConfig({ theme: { ...config.theme, current: theme } })
  }, [theme])

  useEffect(() => {
    if (config.theme?.isSyncWithSystem) {
      const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT
      setTheme(theme)
    }
  }, [config.theme?.isSyncWithSystem, theme])

  const handleSystemThemeChange = useMemo(
    () =>
      ({ matches }: MediaQueryListEvent) => {
        config.theme?.isSyncWithSystem && setTheme(matches ? Theme.DARK : Theme.LIGHT)
      },
    [config.theme?.isSyncWithSystem],
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
