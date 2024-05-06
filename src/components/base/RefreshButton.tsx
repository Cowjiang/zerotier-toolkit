import { Button, ButtonProps } from '@nextui-org/react'
import { useCallback } from 'react'

import { RefreshIcon } from './Icon.tsx'

type Props = {
  labelText?: string
  isLoading?: boolean
  onRefresh?: () => void
  buttonProps?: ButtonProps
}

function RefreshButton({ labelText, isLoading, onRefresh, buttonProps }: Props) {
  const handleRefresh = useCallback(async () => {
    onRefresh?.()
  }, [])

  return (
    <Button onPress={handleRefresh} isLoading={isLoading} {...buttonProps}>
      {buttonProps?.isIconOnly ? <RefreshIcon width="18" height="18" /> : labelText || 'Refresh'}
    </Button>
  )
}

export default RefreshButton
