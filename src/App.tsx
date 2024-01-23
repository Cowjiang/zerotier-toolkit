import { useEffect } from 'react'
import './App.css'
import { Spinner } from '@nextui-org/react'
import Home from './pages/Home.tsx'
import { useZeroTierStore } from './store/zerotier.ts'
import { useAppStore } from './store/app.ts'
import { SERVICE_POLLING_INTERVAL } from '../constant.ts'

function App() {
  const {isLoading, isAdmin, setLoading, checkAdmin} = useAppStore()
  const {getServiceState} = useZeroTierStore()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState()]).then(() => setLoading(false))
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

  return (
    isLoading
      ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      )
      : <Home />
  )
}

export default App
