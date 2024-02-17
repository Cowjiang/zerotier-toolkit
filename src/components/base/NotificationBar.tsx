import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'

import { CloseIcon } from './Icon.tsx'

export type NotificationBarOptions = {
  type?: 'success' | 'warning' | 'error' | 'primary' | 'secondary'
  className?: string
  children?: ReactNode
  hideCloseButton?: boolean
  animate?: boolean
  duration?: number
  onClose?: () => void
}

export type NotificationBarProps = {
  hidden?: boolean
} & NotificationBarOptions

function NotificationBar(props: NotificationBarProps) {
  const styles = useMemo(() => {
    const defaultClassNames = [
      'w-full px-4 py-2 fixed top-0 z-50 flex items-center text-sm font-semibold transition-transform-all',
      props.animate ? 'duration-250' : 'duration-0',
    ]
    if (!props.children) {
      return [...defaultClassNames]
    }
    if (props.className) {
      return [...defaultClassNames, props.className]
    }
    const preset = {
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      error: 'bg-danger text-danger-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
    }
    return [...defaultClassNames, preset?.[props?.type ?? 'primary'] ?? preset['primary']]
  }, [props])

  const closeNotification = () => props.onClose?.()

  return props.children ? (
    <div
      className={classNames([
        ...styles,
        props.hidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto',
      ])}
    >
      {props.children}
      {props.hideCloseButton ? (
        ''
      ) : (
        <CloseIcon
          width={20}
          height={20}
          className="ml-auto cursor-pointer hover:opacity-75"
          onClick={closeNotification}
        />
      )}
    </div>
  ) : (
    <></>
  )
}

export default NotificationBar
