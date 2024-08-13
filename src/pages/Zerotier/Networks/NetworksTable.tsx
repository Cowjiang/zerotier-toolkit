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
import { Key, useCallback, useState } from 'react'

import CopyText from '../../../components/base/CopyText.tsx'
import { ConnectIcon, DisconnectIcon, InfoIcon, RefreshIcon, VerticalDotIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useNotification } from '../../../components/providers/NotificationProvider.tsx'
import { joinNetwork } from '../../../services/zerotierService.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { Network, NetworkStatus } from '../../../typings/zerotier.ts'
import DetailsModal from './DetailsModal.tsx'

function NetworksTable({
  editMode,
  networks,
  isLoading,
  isRefreshing,
  onRefresh,
}: {
  networks: Network[]
  editMode?: boolean
  isLoading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
}) {
  const { setNotification } = useNotification()
  const { getNetworks, disconnectNetwork } = useZeroTierStore()

  const columns: ({ label: string } & Omit<TableColumnProps<any>, 'children'>)[] = [
    { key: 'id', label: 'NETWORK ID', maxWidth: '100' },
    { key: 'name', label: 'NAME', maxWidth: '100' },
    { key: 'status', label: 'STATUS', maxWidth: '100' },
    { key: 'action', label: '', maxWidth: '100' },
  ]

  const statusChip: Record<NetworkStatus | 'UNKNOWN', { label: string; color: ChipProps['color'] }> = {
    OK: { label: 'Connected', color: 'success' },
    DISCONNECTED: { label: 'Disconnected', color: 'secondary' },
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
      if (networkId) {
        await disconnectNetwork(networkId)
        await getNetworks()
      }
    } catch (e) {
      setNotification({
        type: 'danger',
        children: 'Failed to disconnect, please try again later',
        duration: 3000,
      })
    }
  }

  const connect = async (networkId?: string) => {
    try {
      if (networkId) {
        await joinNetwork(networkId)
        await getNetworks()
      }
    } catch (e) {
      setNotification({
        type: 'danger',
        children: 'Failed to disconnect, please try again later',
        duration: 3000,
      })
    }
  }

  const renderCell = useCallback(
    (network: Network, columnKey?: Key | null) => {
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
          const onOpen = () => network?.id && setSelectedKeys(new Set([network.id]))
          const onClose = () => setSelectedKeys(new Set([]))
          const openDetailsModal = () => {
            setSelectedNetwork(network)
            setIsDetailsModalOpen(true)
          }
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown
                backdrop="opaque"
                placement="bottom-end"
                showArrow
                size="sm"
                onOpenChange={onOpen}
                onClose={onClose}
              >
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotIcon className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Actions">
                  <DropdownItem startContent={<InfoIcon {...iconProps} />} title="Details" onPress={openDetailsModal} />
                  {network.status === 'DISCONNECTED' ? (
                    <DropdownItem
                      className="text-success"
                      color="success"
                      variant="flat"
                      startContent={<ConnectIcon {...iconProps} />}
                      title="Connect"
                      onPress={() => connect(network.id)}
                    />
                  ) : (
                    <DropdownItem
                      className="text-danger"
                      color="danger"
                      variant="flat"
                      startContent={<DisconnectIcon {...iconProps} />}
                      title="Disconnect"
                      onPress={() => disconnect(network.id)}
                    />
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return <CopyText copyValue={cellValue}>{cellValue}</CopyText>
      }
    },
    [networks],
  )

  const [selectedKeys, setSelectedKeys] = useState<Set<string | number> | 'all'>()
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  return (
    <div className="overflow-x-auto">
      <Table
        aria-label="Network List"
        removeWrapper
        selectionMode={editMode ? 'multiple' : 'single'}
        color="primary"
        classNames={{
          td: ['whitespace-nowrap'],
          table: isLoading ? ['min-h-[65vh]'] : [],
          loadingWrapper: ['h-[65vh]'],
        }}
        selectedKeys={selectedKeys}
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
                <RefreshButton
                  buttonProps={{
                    color: 'primary',
                    variant: 'flat',
                    endContent: <RefreshIcon width="16" height="16" />,
                  }}
                  isLoading={isRefreshing}
                  onRefresh={onRefresh}
                />
              </div>
            </div>
          }
        >
          {networks.map((network) => (
            <TableRow key={network.id}>
              {(columnKey) => <TableCell>{renderCell(network, columnKey)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DetailsModal
        networkDetails={selectedNetwork}
        modalProps={{
          backdrop: 'blur',
          isOpen: isDetailsModalOpen,
          onClose: () => setIsDetailsModalOpen(false),
        }}
      />
    </div>
  )
}

export default NetworksTable
