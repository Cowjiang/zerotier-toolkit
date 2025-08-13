import { useCallback, useEffect, useState } from 'react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import NetworksTable from './NetworksTable.tsx'
import ToolBar from './ToolBar.tsx'

function ZerotierNetworks() {
  const { request } = useRequest()
  const { networks, getNetworks } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const init = () => {
    !isLoading && !networks.length && setIsLoading(true)
    request(getNetworks())
      .then(() => setIsError(false))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }
  useEffect(init, [])

  const [filterValue, setFilterValue] = useState('')
  const onFilterValueChange = useCallback((value: string) => {
    setFilterValue(value)
  }, [])

  const filteredNetworks = networks.filter(
    (network) => network.id?.includes(filterValue) || network.name?.includes(filterValue),
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await request(getNetworks())
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  return (
    <div className="h-full flex flex-col gap-4">
      <ToolBar
        filterValue={filterValue}
        onFilterValueChange={onFilterValueChange}
        isLoading={isRefreshing}
        onRefresh={onRefresh}
      />
      <NetworksTable
        networks={filteredNetworks}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </div>
  )
}

export default ZerotierNetworks
