import './App.css'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import { useZeroTierStore } from './store/zerotier'
import { useAppStore } from './store/app'
import { SERVICE_POLLING_INTERVAL } from '../constant'
import Splash from './pages/Splash'
import Home from './pages/Home'
import Dev from './pages/Dev'

function App() {
  const navigate = useNavigate()

  const {isAdmin, setLoading, checkAdmin} = useAppStore()
  const {getServiceState, getServiceStartType, getServerInfo} = useZeroTierStore()

  useEffect(() => {
    Promise.all([
      checkAdmin(),
      getServiceState(),
      getServiceStartType(),
      getServerInfo()
    ]).finally(() => setLoading(false))
  }, [])

  const pollingInterval = () => setInterval(getServiceState, SERVICE_POLLING_INTERVAL)
  useEffect(() => {
    let pollingTimer: number
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

  import.meta.env.DEV && useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        const isDevPage = window.location.pathname === '/dev'
        !isDevPage && (window.location.href = '/dev')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
