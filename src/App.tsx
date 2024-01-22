import { useEffect } from 'react'
import './App.css'
import { Spinner } from '@nextui-org/react';
import Home from './pages/Home.tsx';
import { useZeroTierStore } from './store/zerotier.ts'
import { useAppStore } from './store/app.ts'

function App() {
  const {isLoading, setLoading, checkAdmin} = useAppStore()
  const {getServiceState} = useZeroTierStore()

  useEffect(() => {
    Promise.all([checkAdmin(), getServiceState()]).then(() => setLoading(false))
  }, []);

  useEffect(() => {
    const healthcheck = setInterval(getServiceState, 2000);
    return () => clearInterval(healthcheck);
  }, []);

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
