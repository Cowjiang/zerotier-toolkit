import { Button, ButtonProps } from '@heroui/react'

import { RefreshIcon } from './Icon.tsx'
import { Trans } from 'react-i18next'

type Props = {
  labelText?: string
  isLoading?: boolean
  buttonProps?: ButtonProps
  showIcon?: boolean
  onRefresh?: () => void
}

function RefreshButton({ labelText, isLoading, onRefresh, buttonProps, showIcon }: Props) {
  const Icon = <RefreshIcon width="20" height="20" />

  return (
    <Button onPress={() => onRefresh?.()} isLoading={isLoading} {...buttonProps}>
      {buttonProps?.isIconOnly ? (
        Icon
      ) : (
        <>
          {showIcon && !isLoading && Icon}
          <Trans>{labelText || 'Refresh'}</Trans>
        </>
      )}
    </Button>
  )
}

export default RefreshButton
