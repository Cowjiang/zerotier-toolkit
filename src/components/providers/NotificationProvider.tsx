import { createContext, ReactNode, useContext, useState } from 'react'

import NotificationBar, { NotificationBarOptions, NotificationBarProps } from '../NotificationBar.tsx'

type NotificationContext = {
  setNotification: (props: NotificationBarProps) => void
  closeNotification: () => void
}

const NotificationContext = createContext<NotificationContext | null>(null)

function NotificationProvider({ children }: { children: ReactNode }) {
  const initialOptions: NotificationBarProps = {
    type: 'primary',
    animate: true,
  }
  const [options, setOptions] = useState<NotificationBarProps>(initialOptions)
  const [hidden, setHidden] = useState(true)

  const [autoCloseTimer, setAutoCloseTimer] = useState<number | undefined>(undefined)

  const setNotification = (options: NotificationBarOptions) => {
    clearTimer()
    setOptions({ ...initialOptions, ...options })
    setTimeout(() => setHidden(false), 0)
    options.duration && setAutoCloseTimer(setTimeout(closeNotification, options.duration))
  }
  const closeNotification = () => {
    clearTimer()
    setHidden(true)
    setTimeout(() => setOptions(initialOptions), options.animate ? 250 : 0)
  }

  const clearTimer = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      setAutoCloseTimer(undefined)
    }
  }

  return (
    <NotificationContext.Provider value={{ setNotification, closeNotification }}>
      {children}
      <NotificationBar onClose={closeNotification} hidden={hidden} {...options} />
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export default NotificationProvider
