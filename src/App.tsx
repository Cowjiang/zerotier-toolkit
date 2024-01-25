import './App.css'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { NextUIProvider, Spinner } from '@nextui-org/react'
import { useZeroTierStore } from './store/zerotier.ts'
import { useAppStore } from './store/app.ts'
import { SERVICE_POLLING_INTERVAL } from '../constant.ts'
import { useNotification } from './components/NotificationBar'
import Home from './pages/Home'
import Dev from './pages/Dev'

function App() {
  const navigate = useNavigate()

  const {isLoading, isAdmin, setLoading, checkAdmin, restartAsAdmin} = useAppStore()
  const {getServiceState} = useZeroTierStore()

  const {setNotification} = useNotification()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    !isAdmin && !isLoading && setNotification({
      type: 'warning',
      children: <div className="cursor-pointer" onClick={restartAsAdmin}>Please click here to relaunch with administrator privileges to access all functionalities</div>
    })
  }, [isAdmin, isLoading])

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

  return (
    <NextUIProvider navigate={navigate}>
      <div className="text-foreground">
        {
          isLoading
            ? (
              <div className="w-screen h-screen flex justify-center items-center bg-background z-[100]">
                <Spinner size="lg" />
              </div>
            )
            : (
              <Routes>
                <Route path="/" element={<Home />} />
                {import.meta.env.DEV && <Route path="/dev" element={<Dev />} />}
                <Route path="*" element={<Home />} />
              </Routes>
            )
        }
      </div>
    </NextUIProvider>
  )
}

export default App
