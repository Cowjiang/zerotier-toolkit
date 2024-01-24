import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import classNames from 'classnames';
import { CloseIcon } from './Icon.tsx';

type NotificationBarProps = {
  type: 'success' | 'warning' | 'error' | 'primary' | 'secondary'
  className?: string
  children?: ReactNode
  hideCloseButton?: boolean
  onClose?: () => void
}

type NotificationContext = {
  setNotification: (props: NotificationBarProps) => void
}

const NotificationContext = createContext<NotificationContext | null>(null)

function NotificationBar(props: NotificationBarProps) {
  const styles = useMemo(() => {
    const defaultClassName = 'w-full px-4 py-2 fixed top-0 z-50 flex items-center text-sm font-semibold'
    if (!props.children) {
      return [defaultClassName]
    }
    if (props.className) {
      return [defaultClassName, props.className]
    }
    const preset = {
      'success': 'bg-success text-success-foreground',
      'warning': 'bg-warning text-warning-foreground',
      'error': 'bg-danger text-danger-foreground',
      'primary': 'bg-primary text-primary-foreground',
      'secondary': 'bg-secondary text-secondary-foreground'
    }
    return [defaultClassName, preset?.[props.type] ?? preset['primary']]
  }, [props])

  const closeNotification = () => props.onClose?.()

  return (
    props.children ? (
      <div className={classNames(styles)}>
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
    type: 'primary'
  }
  const [options, setOptions] = useState<NotificationBarProps>(initialOptions)
  const setNotification = (props: NotificationBarProps) => {
    setOptions(props)
  }

  return (
    <NotificationContext.Provider value={{setNotification}}>
      {children}
      <NotificationBar
        onClose={() => setOptions(initialOptions)}
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
