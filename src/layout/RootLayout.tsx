import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  CommandIcon,
  FlaskIcon,
  InterrogationIcon,
  NetworkIcon,
  PaintIcon,
  ServiceIcon,
  StatusIcon,
  WindowIcon,
} from '../components/base/Icon.tsx'
import SideMenu, { MenuListItem, MenuListSection } from '../components/base/SideMenu.tsx'
import TitleBar from '../components/base/TitleBar.tsx'
import TitleBarButtons from '../components/base/TitleBarButtons.tsx'
import { TAURI_DRAG_REGION } from '../constant.ts'
import Splash from '../pages/Splash.tsx'
import { useAppStore } from '../store/app.ts'

const iconProps = { width: 16 }

const routes: MenuListSection[] = [
  {
    key: 'ZeroTier',
    title: 'ZeroTier',
    path: '/zerotier',
    items: [
      {
        path: '/zerotier/networks',
        title: 'Networks',
        description: 'Manage ZeroTier Networks',
        startContent: <NetworkIcon {...iconProps} />,
      },
      {
        path: '/zerotier/status',
        title: 'Status',
        startContent: <StatusIcon {...iconProps} />,
        description: 'My status of ZeroTier',
      },
      // #if WINDOWS
      {
        path: '/zerotier/service',
        title: 'Service',
        startContent: <ServiceIcon {...iconProps} />,
        description: 'Manage ZeroTier Service',
      },
      // #endif
      {
        path: '/zerotier/experiments',
        title: 'Experimental',
        startContent: <FlaskIcon {...iconProps} />,
        description: 'Experimental features to customize ZeroTier',
      },
    ],
  },
  {
    key: 'Settings',
    title: 'Settings',
    showDivider: true,
    path: '/settings',
    items: [
      {
        path: '/settings/appearance',
        title: 'Appearance',
        description: 'Customize the appearance of the application',
        startContent: <PaintIcon {...iconProps} />,
      },
      {
        path: '/settings/general',
        title: 'General',
        description: 'Configure general settings of the application',
        startContent: <WindowIcon {...iconProps} />,
      },
    ],
  },
  {
    key: 'Others',
    title: '',
    items: [
      {
        path: '/troubleshooting',
        title: 'Troubleshooting',
        description: 'Check ZeroTier status and troubleshoot issues',
        startContent: <InterrogationIcon {...iconProps} />,
      },
      {
        path: '/about',
        title: 'About',
        description: '',
        startContent: <CommandIcon {...iconProps} />,
      },
    ],
  },
]

function RootLayout() {
  const { showSplash } = useAppStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const currentTab = getCurrentTab()
    if (!!currentTab) {
      setCurrentTab(currentTab)
      return
    }
    navigate('/zerotier/networks', { replace: true })
  }, [pathname])

  const [currentTab, setCurrentTab] = useState<MenuListItem>()

  const getCurrentTab = (): MenuListItem | undefined => {
    return (
      routes.find((item) => item?.path === pathname)?.items[0] ??
      routes.flatMap(({ items }) => items).find((item) => item?.path === pathname)
    )
  }

  return (
    <div>
      <TitleBarButtons />
      {showSplash ? (
        <Splash />
      ) : (
        <div className="w-full h-screen flex overflow-y-hidden pt-1">
          <SideMenu items={routes} tabPath={currentTab?.path} />
          <div className="w-full h-full flex flex-col px-6 pt-4 mr-4 overflow-hidden" {...TAURI_DRAG_REGION}>
            <TitleBar title={currentTab?.title} description={currentTab?.description} />
            <div className="w-full h-full flex flex-col overflow-y-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RootLayout
