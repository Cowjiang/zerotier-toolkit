import './App.css'

import { NextUIProvider } from '@nextui-org/react'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import RootLayout from './components/layout/RootLayout.tsx'
import NotificationProvider from './components/providers/NotificationProvider.tsx'
import ThemeProvider from './components/providers/ThemeProvider.tsx'
import { SERVICE_POLLING_INTERVAL } from './constant.ts'
import Dev from './pages/Dev'
import Setting from './pages/Setting.tsx'
import Zerotier from './pages/Zerotier.tsx'
import { useAppStore } from './store/app'
import { useZeroTierStore } from './store/zerotier'
import useTauriEventListener from './utils/hooks/useTauriEventListener.ts'

function App() {
  const navigate = useNavigate()
  useTauriEventListener('NAVIGATE', (url: string) => navigate(url))

  const { isAdmin, setLoading, checkAdmin } = useAppStore()
  const { getServiceState, getServiceStartType, getServerInfo } = useZeroTierStore()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState(), getServiceStartType(), getServerInfo()]).finally(() =>
      setLoading(false),
    )
  }, [])

  const pollingInterval = () => setInterval(getServiceState, SERVICE_POLLING_INTERVAL)
  useEffect(() => {
    let pollingTimer: ReturnType<typeof setInterval>
    if (isAdmin) {
      pollingTimer = pollingInterval()
    }
    const handleVisibilityChange = () => {
      clearInterval(pollingTimer)
      if (document.visibilityState === 'visible' && isAdmin) {
        pollingTimer = pollingInterval()
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(pollingTimer)
    }
  }, [isAdmin, getServiceState])

  import.meta.env.DEV &&
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'd') {
          let redirectUrl = '/'
          const isDevPage = window.location.pathname === '/dev'
          if (!isDevPage) {
            redirectUrl = '/dev'
          }
          window.location.href = redirectUrl
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [])

  return (
    <NextUIProvider navigate={navigate}>
      <ThemeProvider>
        <NotificationProvider>
          <div className="text-foreground">
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route path="/home" element={<Zerotier />} />
                <Route path="/networks" element={<Zerotier tab="Networks" />} />
                <Route path="/status" element={<Zerotier tab="Status" />} />
                <Route path="/service" element={<Zerotier tab="Service" />} />
                <Route path="/setting/*" element={<Setting />} />
                <Route path="*" element={<Zerotier />} />
              </Route>
              {import.meta.env.DEV && <Route path="/dev" element={<Dev />} />}
            </Routes>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </NextUIProvider>
  )
}

export default App
