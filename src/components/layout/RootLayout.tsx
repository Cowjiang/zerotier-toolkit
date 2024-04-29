import { Outlet, useLocation } from 'react-router-dom'

import Splash from '../../pages/Splash.tsx'
import { useAppStore } from '../../store/app.ts'

function RootLayout() {
  const { showSplash } = useAppStore()
  const { pathname } = useLocation()

  return <div>{showSplash ? <Splash navigatePath={pathname} /> : <Outlet />}</div>
}

export default RootLayout
