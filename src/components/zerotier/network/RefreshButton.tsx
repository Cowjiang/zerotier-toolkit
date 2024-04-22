import { Button, ButtonProps } from '@nextui-org/react'
import { useCallback, useState } from 'react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import { RefreshIcon } from '../../base/Icon.tsx'

function RefreshButton(props: ButtonProps) {
  const { getNetworks } = useZeroTierStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await getNetworks()
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  return (
    <Button onPress={onRefresh} isLoading={isRefreshing} {...props}>
      {props?.isIconOnly ? <RefreshIcon width="18" height="18" /> : 'Refresh'}
    </Button>
  )
}

export default RefreshButton
