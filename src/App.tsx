import './App.css'

import { NextUIProvider } from '@nextui-org/react'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import NotificationProvider from './components/providers/NotificationProvider.tsx'
import ThemeProvider from './components/providers/ThemeProvider.tsx'
import { SERVICE_POLLING_INTERVAL } from './constant.ts'
import RootLayout from './layout/RootLayout.tsx'
import About from './pages/About.tsx'
// #if DEV
import Dev from './pages/Dev'
// #endif
import AppearanceSetting from './pages/Settings/AppearanceSetting.tsx'
import GeneralSetting from './pages/Settings/GeneralSetting.tsx'
import Troubleshooting from './pages/Troubleshooting.tsx'
import ZerotierExperiments from './pages/Zerotier/Experiments/ZerotierExperiments.tsx'
import ZerotierNetworks from './pages/Zerotier/Networks/ZerotierNetworks.tsx'
import ZerotierService from './pages/Zerotier/Service/ZerotierService.tsx'
import ZerotierStatus from './pages/Zerotier/Status/ZerotierStatus.tsx'
import { useAppStore } from './store/app'
import { useZeroTierStore } from './store/zerotier'
import { showWindow } from './utils/helpers/tauriHelpers.ts'
import useTauriEventListener from './utils/hooks/useTauriEventListener.ts'

function App() {
  const navigate = useNavigate()
  useTauriEventListener('NAVIGATE', async (url: string) => {
    navigate(url)
    await showWindow()
  })

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

  // #if DEV
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
  // #endif

  return (
    <NextUIProvider navigate={navigate}>
      <ThemeProvider>
        <NotificationProvider>
          <div className="text-foreground">
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route path="/home" element={<ZerotierNetworks />} />
                <Route path="/zerotier/networks" element={<ZerotierNetworks />} />
                <Route path="/zerotier/status" element={<ZerotierStatus />} />
                <Route path="/zerotier/service" element={<ZerotierService />} />
                <Route path="/zerotier/experiments" element={<ZerotierExperiments />} />
                <Route path="/settings" element={<AppearanceSetting />} />
                <Route path="/settings/appearance" element={<AppearanceSetting />} />
                <Route path="/settings/general" element={<GeneralSetting />} />
                <Route path="/troubleshooting" element={<Troubleshooting />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<ZerotierNetworks />} />
              </Route>
              {/* #if DEV */}
              <Route path="/dev" element={<Dev />} />
              {/* #endif  */}
            </Routes>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </NextUIProvider>
  )
}

export default App
