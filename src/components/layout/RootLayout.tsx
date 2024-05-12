import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import Splash from '../../pages/Splash.tsx'
import { useAppStore } from '../../store/app.ts'
import TitleBarButtons from '../base/TitleBarButtons.tsx'

function RootLayout() {
  const { showSplash } = useAppStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') {
      navigate('/home', { replace: true })
    }
  }, [pathname])

  return (
    <div>
      {showSplash ? (
        <Splash navigatePath={pathname} />
      ) : (
        <div>
          <TitleBarButtons />
          <Outlet />
        </div>
      )}
    </div>
  )
}

export default RootLayout
