import { useEffect } from 'react'
import './App.css'
import { Spinner } from '@nextui-org/react'
import Home from './pages/Home.tsx'
import { useZeroTierStore } from './store/zerotier.ts'
import { useAppStore } from './store/app.ts'

function App() {
  const {isLoading, setLoading, checkAdmin} = useAppStore()
  const {getServiceState} = useZeroTierStore()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState()]).then(() => setLoading(false))
  }, [])

  useEffect(() => {
    let healthcheck = setInterval(getServiceState, 2000)
    const handleVisibilityChange = () => {
      clearInterval(healthcheck)
      if (document.visibilityState === 'visible') {
        healthcheck = setInterval(getServiceState, 2000)
      }
    }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(healthcheck)
    }
  }, [])

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
