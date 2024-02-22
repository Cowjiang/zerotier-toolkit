import { act, render } from '@testing-library/react'

import { useAppStore } from '../../../store/app.ts'
import { ThemeConfig } from '../../../typings/config.ts'
import ThemeProvider from '../ThemeProvider.tsx'

describe('ThemeProvider', () => {
  it('should render the theme with default theme', () => {
    render(
      <ThemeProvider defaultTheme="test">
        <div></div>
      </ThemeProvider>,
    )
    const currentTheme = useAppStore.getState().config[ThemeConfig.CURRENT]
    expect(currentTheme).toBe('test')
  })

  it('should sync with the theme of system', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: vi.fn(),
      })),
    })
    useAppStore.setState({ hasHydrated: true, config: { [ThemeConfig.IS_SYNC_WITH_SYSTEM]: false } })
    render(
      <ThemeProvider>
        <div></div>
      </ThemeProvider>,
    )
    expect(useAppStore.getState().config[ThemeConfig.CURRENT]).toBe('light')

    act(() => {
      useAppStore.setState({ config: { [ThemeConfig.IS_SYNC_WITH_SYSTEM]: true } })
    })
    expect(useAppStore.getState().config[ThemeConfig.CURRENT]).toBe('dark')

    expect(addEventListener).toHaveBeenCalled()
    expect(removeEventListener).toHaveBeenCalled()
  })
})
