import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { ReactElement, useEffect } from 'react'

import { useAppStore } from '../../store/app.ts'

type ContentProps = { children: ReactElement }

function Content({ children }: ContentProps) {
  const { theme } = useTheme()
  const { setConfig } = useAppStore()
  useEffect(() => setConfig({ theme }), [theme])
  return children
}

const ThemeProvider = ({ children, ...props }: ThemeProviderProps & ContentProps) => (
  <NextThemesProvider attribute="class" defaultTheme="light" {...props}>
    <Content>{children}</Content>
  </NextThemesProvider>
)

export default ThemeProvider
