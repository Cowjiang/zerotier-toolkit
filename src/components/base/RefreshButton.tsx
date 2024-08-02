import { Button, ButtonProps } from '@nextui-org/react'
import { useCallback } from 'react'

import { RefreshIcon } from './Icon.tsx'

type Props = {
  labelText?: string
  isLoading?: boolean
  buttonProps?: ButtonProps
  showIcon?: boolean
  onRefresh?: () => void
}

function RefreshButton({ labelText, isLoading, onRefresh, buttonProps, showIcon }: Props) {
  const Icon = <RefreshIcon width="20" height="20" />

  const handleRefresh = useCallback(async () => {
    onRefresh?.()
  }, [])

  return (
    <Button onPress={handleRefresh} isLoading={isLoading} {...buttonProps}>
      {buttonProps?.isIconOnly ? (
        Icon
      ) : (
        <>
          {showIcon && !isLoading && Icon}
          {labelText || 'Refresh'}
        </>
      )}
    </Button>
  )
}

export default RefreshButton
