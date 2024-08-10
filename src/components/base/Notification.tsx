import classNames from 'classnames'
import { ReactNode, useMemo } from 'react'

import { CloseIcon } from './Icon.tsx'

export type NotificationBarOptions = {
  type?: 'success' | 'warning' | 'danger' | 'primary' | 'secondary'
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

function Notification(props: NotificationBarProps) {
  const styles = useMemo(() => {
    const defaultClassNames = [
      'px-4 py-2.5 fixed bottom-6 left-0 z-[10000] translate-x-[calc(50vw-50%)] flex items-center text-sm transition-colors-opacity rounded-lg',
      props.animate ? 'duration-250' : 'duration-0',
    ]
    if (!props.children) {
      return [...defaultClassNames]
    }
    if (props.className) {
      return [...defaultClassNames, props.className]
    }
    const preset = {
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      danger: 'bg-danger/20 text-danger',
      primary: 'bg-primary/20 text-primary',
      secondary: 'bg-secondary/20 text-secondary',
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
      {!props.hideCloseButton && (
        <CloseIcon
          width={18}
          height={18}
          className="ml-2 cursor-pointer hover:opacity-75"
          onClick={closeNotification}
        />
      )}
    </div>
  ) : (
    <></>
  )
}

export default Notification
