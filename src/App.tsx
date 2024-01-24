import { useEffect } from 'react'
import './App.css'
import { Spinner } from '@nextui-org/react'
import Home from './pages/Home.tsx'
import { useZeroTierStore } from './store/zerotier.ts'
import { useAppStore } from './store/app.ts'
import { SERVICE_POLLING_INTERVAL } from '../constant.ts'
import { useNotification } from './components/NotificationBar.tsx'

function App() {
  const {isLoading, isAdmin, setLoading, checkAdmin,restartAsAdmin} = useAppStore()
  const {getServiceState} = useZeroTierStore()

  const {setNotification} = useNotification()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      setNotification({
        type: 'warning',
        children: <div className="cursor-pointer" onClick={()=>{
          restartAsAdmin()
        }}>Please click here to relaunch with administrator privileges to access all functionalities</div>
      })
    } else {
      setNotification({})
    }
  }, [isAdmin, isLoading]);

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
    <div className="text-foreground">
      {
        isLoading
          ? (
            <div className="w-screen h-screen flex justify-center items-center bg-background z-[100]">
              <Spinner size="lg" />
            </div>
          )
          : <Home />
      }
    </div>
  )
}

export default App
