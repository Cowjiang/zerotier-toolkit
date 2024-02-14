import './App.css'

import { NextUIProvider } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import { SERVICE_POLLING_INTERVAL } from '../constant'
import Dev from './pages/Dev'
import Home from './pages/Home'
import Splash from './pages/Splash'
import { useAppStore } from './store/app'
import { useZeroTierStore } from './store/zerotier'

function App() {
  const navigate = useNavigate()

  const { isAdmin, setLoading, checkAdmin, setConfig } = useAppStore()
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

  const { theme } = useTheme()
  useEffect(() => {
    setConfig({ theme })
  }, [theme])

  useEffect(() => {}, [])

  return (
    <NextUIProvider navigate={navigate}>
      <div className="text-foreground">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Home />} />
          {import.meta.env.DEV && <Route path="/dev" element={<Dev />} />}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </NextUIProvider>
  )
}

export default App
