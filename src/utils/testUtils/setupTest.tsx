import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { mockServer } from '../../__mocks__/zerotier.ts'
import NotificationProvider from '../../components/providers/NotificationProvider.tsx'
import { useZeroTierStore } from '../../store/zerotier.ts'

vi.mock('zustand')

beforeEach(() => {
  useZeroTierStore.setState({ serverInfo: { port: 9999, secret: 'test' } })
  mockIPC(async (cmd, args) => {
    if (cmd === 'tauri' && (args.message as any)?.cmd === 'httpRequest') {
      const { url, method } = (args.message as any).options
      const res = await fetch(url, {
        method,
      })
      return {
        url,
        status: res.status,
        ok: res.ok,
        data: JSON.stringify(await res.json()),
      }
    }
  })
  mockWindows('main')
})
beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  clearMocks()
  mockServer.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => {
  mockServer.close()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <NotificationProvider>{children}</NotificationProvider>
    </BrowserRouter>
  )
}

const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options })

export { renderWithProviders as render }
