import {
  Button,
  Chip,
  ChipProps,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumnProps,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { Key, useCallback } from 'react'

import { leaveNetwork } from '../../../services/zerotierService.ts'
import { Network, NetworkStatus } from '../../../typings/zerotier.ts'
import { DisconnectIcon, InfoIcon, RefreshIcon, VerticalDotIcon } from '../../base/Icon.tsx'
import { useNotification } from '../../providers/NotificationProvider.tsx'
import RefreshButton from './RefreshButton.tsx'

function NetworksTable({
  editMode,
  networks,
  isLoading,
}: {
  networks: Network[]
  editMode?: boolean
  isLoading?: boolean
}) {
  const { setNotification } = useNotification()

  const columns: ({ label: string } & Omit<TableColumnProps<any>, 'children'>)[] = [
    { key: 'id', label: 'NETWORK ID', maxWidth: '100' },
    { key: 'name', label: 'NAME', maxWidth: '100' },
    { key: 'status', label: 'STATUS', maxWidth: '100' },
    { key: 'action', label: '', maxWidth: '100' },
  ]

  const statusChip: Record<NetworkStatus | 'UNKNOWN', { label: string; color: ChipProps['color'] }> = {
    OK: { label: 'Connected', color: 'success' },
    REQUESTING_CONFIGURATION: { label: 'Requesting Config', color: 'default' },
    ACCESS_DENIED: { label: 'Access Denied', color: 'warning' },
    NOT_FOUND: { label: 'Not Found', color: 'danger' },
    PORT_ERROR: { label: 'Port Error', color: 'danger' },
    CLIENT_TOO_OLD: { label: 'Client Too Old', color: 'default' },
    AUTHENTICATION_REQUIRED: { label: 'Auth Required', color: 'warning' },
    UNKNOWN: { label: 'Unknown', color: 'default' },
  }

  const disconnect = async (networkId?: string) => {
    try {
      networkId && (await leaveNetwork(networkId))
    } catch (e) {
      setNotification({
        type: 'warning',
        children: 'Failed to disconnect, please try again later.',
        duration: 3000,
      })
    }
  }

  const renderCell = useCallback((network: Network, columnKey: Key) => {
    const cellValue = network[columnKey as keyof Network] as string | number | boolean | undefined
    switch (columnKey) {
      case 'status':
        return (
          <Chip
            className="capitalize"
            color={statusChip?.[network?.status ?? 'UNKNOWN']?.color}
            size="sm"
            variant="flat"
          >
            {statusChip?.[network?.status ?? 'UNKNOWN']?.label ?? cellValue}
          </Chip>
        )
      case 'action':
        const iconProps = { width: 16, height: 16 }
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown backdrop="opaque" placement="bottom-end" showArrow size="sm">
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotIcon className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem startContent={<InfoIcon {...iconProps} />}>Details</DropdownItem>
                {/*<DropdownItem className="text-success" color="success" variant="flat" startContent={<ConnectIcon {...iconProps} />}>Connect</DropdownItem>*/}
                <DropdownItem
                  className="text-danger"
                  color="danger"
                  variant="flat"
                  startContent={<DisconnectIcon {...iconProps} />}
                  onPress={() => disconnect(network.id)}
                >
                  Disconnect
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )
      default:
        return cellValue
    }
  }, [])

  return (
    <div className="overflow-x-auto">
      <Table
        aria-label="Network List"
        removeWrapper
        selectionMode={editMode ? 'multiple' : 'single'}
        classNames={{
          td: ['whitespace-nowrap'],
          table: isLoading ? ['min-h-[65vh]'] : [],
          loadingWrapper: ['h-[65vh]'],
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} maxWidth={column.maxWidth}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={networks}
          loadingContent={
            <div className="w-full flex flex-col justify-center items-center gap-4 h-[50vh]">
              <Spinner label="Loading..." color="primary" />
            </div>
          }
          emptyContent={
            <div className="flex flex-col justify-center gap-4 h-[50vh]">
              <span>No networks to display.</span>
              <div>
                <RefreshButton variant="flat" color="primary" endContent={<RefreshIcon width="16" height="16" />} />
              </div>
            </div>
          }
        >
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

export default NetworksTable
