import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import classNames from 'classnames'
import { CloseIcon } from './Icon.tsx'

type NotificationBarOptions = {
  type?: 'success' | 'warning' | 'error' | 'primary' | 'secondary'
  className?: string
  children?: ReactNode
  hideCloseButton?: boolean
  animate?: boolean
  onClose?: () => void
}

type NotificationBarProps = {
  hidden?: boolean
} & NotificationBarOptions

type NotificationContext = {
  setNotification: (props: NotificationBarProps) => void
  closeNotification: () => void
}

const NotificationContext = createContext<NotificationContext | null>(null)

function NotificationBar(props: NotificationBarProps) {
  const styles = useMemo(() => {
    const defaultClassNames = [
      'w-full px-4 py-2 fixed top-0 z-50 flex items-center text-sm font-semibold transition-transform-all',
      props.animate ? 'duration-250' : 'duration-0'
    ]
    if (!props.children) {
      return [...defaultClassNames]
    }
    if (props.className) {
      return [...defaultClassNames, props.className]
    }
    const preset = {
      'success': 'bg-success text-success-foreground',
      'warning': 'bg-warning text-warning-foreground',
      'error': 'bg-danger text-danger-foreground',
      'primary': 'bg-primary text-primary-foreground',
      'secondary': 'bg-secondary text-secondary-foreground'
    }
    return [...defaultClassNames, preset?.[props?.type ?? 'primary'] ?? preset['primary']]
  }, [props])

  const closeNotification = () => props.onClose?.()

  return (
    props.children ? (
      <div className={classNames(
        [...styles, props.hidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto']
      )}>
        {props.children}
        {props.hideCloseButton ? '' : (
          <CloseIcon
            className="ml-auto cursor-pointer"
            onClick={closeNotification}
          />
        )}
      </div>
    ) : <></>
  )
}

function NotificationProvider({children}: { children: ReactNode }) {
  const initialOptions: NotificationBarProps = {
    type: 'primary',
    animate: true
  }
  const [options, setOptions] = useState<NotificationBarProps>(initialOptions)
  const [hidden, setHidden] = useState(true)

  const setNotification = (options: NotificationBarOptions) => {
    setOptions({...initialOptions, ...options})
    setTimeout(() => setHidden(false), options.animate ? 250 : 0)
  }
  const closeNotification = () => {
    setHidden(true)
    setTimeout(() => setOptions(initialOptions), options.animate ? 250 : 0)
  }

  return (
    <NotificationContext.Provider value={{setNotification, closeNotification}}>
      {children}
      <NotificationBar
        onClose={closeNotification}
        hidden={hidden}
        {...options}
      />
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
