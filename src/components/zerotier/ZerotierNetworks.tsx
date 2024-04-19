import {
  Button,
  Chip,
  ChipProps,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { Key, useCallback, useEffect, useState } from 'react'

import { useZeroTierStore } from '../../store/zerotier.ts'
import { Network } from '../../typings/zerotier.ts'
import { PlusIcon, SearchIcon } from '../base/Icon.tsx'

function ToolBar({
  editMode,
  onEditChange,
  filterValue,
  onFilterValueChange,
}: {
  editMode?: boolean
  onEditChange?: () => void
  filterValue: string
  onFilterValueChange?: (value: string) => void
}) {
  return (
    <div className="w-full flex items-center gap-2">
      <Input
        isClearable
        className="w-full"
        placeholder="Search by Network ID..."
        startContent={<SearchIcon width="18" height="18" />}
        value={filterValue}
        onClear={() => onFilterValueChange?.('')}
        onValueChange={(value) => onFilterValueChange?.(value)}
      />
      <Button
        className="flex-shrink-0"
        color={editMode ? 'warning' : 'default'}
        variant="flat"
        onPress={() => onEditChange?.()}
      >
        {editMode ? 'Cancel' : 'Edit'}
      </Button>
      <Button className="flex-shrink-0" color="warning" endContent={<PlusIcon />}>
        Join New
      </Button>
    </div>
  )
}

function NetworksTable({ editMode, networks }: { networks: Network[]; editMode?: boolean }) {
  const columns = [
    { key: 'id', label: 'NETWORK ID' },
    { key: 'name', label: 'NAME' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ]

  const statusChip: Record<string, { label: string; color: ChipProps['color'] }> = {
    OK: { label: 'Connected', color: 'success' },
  }

  const renderCell = useCallback((network: Network, columnKey: Key) => {
    const cellValue = network[columnKey as keyof Network] as string | number | boolean | undefined
    switch (columnKey) {
      case 'status':
        return (
          <Chip className="capitalize" color={statusChip?.[network?.status ?? ''].color} size="sm" variant="flat">
            {statusChip?.[network?.status ?? ''].label ?? 'UNKNOWN'}
          </Chip>
        )
      default:
        return cellValue
    }
  }, [])

  return (
    <div>
      <Table aria-label="Network List" removeWrapper selectionMode={editMode ? 'multiple' : 'single'}>
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={networks} emptyContent="No networks to display.">
          {(network) => (
            <TableRow key={network.id}>
              {(columnKey) => <TableCell>{renderCell(network, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ZerotierNetworks() {
  const { networks, getNetworks } = useZeroTierStore()
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

  useEffect(() => {
    getNetworks().catch((e) => {
      console.error(e)
    })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <ToolBar
        editMode={editMode}
        onEditChange={onEditChange}
        filterValue={filterValue}
        onFilterValueChange={onFilterValueChange}
      />
      <NetworksTable networks={filteredNetworks} editMode={editMode} />
    </div>
  )
}

export default ZerotierNetworks
