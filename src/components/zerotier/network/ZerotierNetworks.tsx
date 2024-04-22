import { useCallback, useEffect, useState } from 'react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import NetworksTable from './NetworksTable.tsx'
import ToolBar from './ToolBar.tsx'

function ZerotierNetworks() {
  const { networks, getNetworks } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(false)
  const init = () => {
    !isLoading && !networks.length && setIsLoading(true)
    getNetworks().finally(() => {
      setIsLoading(false)
    })
  }
  useEffect(init, [])

  const [editMode, setEditMode] = useState(false)
  const onEditChange = () => {
    setEditMode(!editMode)
  }

  const [filterValue, setFilterValue] = useState('')
  const onFilterValueChange = useCallback((value: string) => {
    setFilterValue(value)
  }, [])

  const filteredNetworks = networks.filter(
    (network) => network.id?.includes(filterValue) || network.name?.includes(filterValue),
  )

  return (
    <div className="h-full flex flex-col gap-4">
      <ToolBar
        editMode={editMode}
        onEditChange={onEditChange}
        filterValue={filterValue}
        onFilterValueChange={onFilterValueChange}
      />
      <NetworksTable networks={filteredNetworks} editMode={editMode} isLoading={isLoading} />
    </div>
  )
}

export default ZerotierNetworks
