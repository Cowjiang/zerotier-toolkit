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
} from '@heroui/react'
import { Key, useCallback, useRef, useState } from 'react'

import CopyText from '../../../components/base/CopyText.tsx'
import {
  ConnectIcon,
  DisconnectIcon,
  InfoIcon,
  RefreshIcon,
  TrashIcon,
  VerticalDotIcon,
} from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useNotification } from '../../../components/providers/NotificationProvider.tsx'
import { joinNetwork } from '../../../services/zerotierService.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { HttpResponse } from '../../../typings/global.ts'
import { Network, NetworkStatus } from '../../../typings/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import DetailsModal from './DetailsModal.tsx'
import { Trans } from 'react-i18next'
import { t } from 'i18next'

function NetworksTable({
  networks,
  isLoading,
  isRefreshing,
  onRefresh,
}: {
  networks: Network[]
  isLoading?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
}) {
  const { request } = useRequest()
  const { setNotification } = useNotification()
  const { getNetworks, disconnectNetwork, deleteNetwork } = useZeroTierStore()

  const tableRef = useRef<HTMLTableElement>(null)

  const columns: ({ label: string } & Omit<TableColumnProps<any>, 'children'>)[] = [
    { key: 'id', label: 'NETWORK ID', maxWidth: '100' },
    { key: 'name', label: 'NAME', maxWidth: '100' },
    { key: 'status', label: 'STATUS', maxWidth: '100' },
    { key: 'action', label: '', maxWidth: '100' },
  ]

  const statusChip: Record<NetworkStatus | 'UNKNOWN', { label: string; color: ChipProps['color'] }> = {
    OK: { label: 'Connected', color: 'success' },
    DISCONNECTED: { label: 'Disconnected', color: 'secondary' },
    REQUESTING_CONFIGURATION: { label: 'Requesting', color: 'default' },
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
        setLoadingId((loadingId) => [...loadingId, networkId])
        await request(disconnectNetwork(networkId))
        await request(getNetworks())
      }
    } catch (e) {
      if ((e as HttpResponse<void>)?.status !== 401) {
        setNotification({
          type: 'danger',
          children: 'Failed to disconnect, please try again later',
          duration: 3000,
        })
      }
    }
    setLoadingId((loadingId) => [...loadingId.filter((id) => id !== networkId)])
  }

  const connect = async (networkId?: string) => {
    try {
      if (networkId) {
        setLoadingId((loadingId) => [...loadingId, networkId])
        await request(joinNetwork(networkId))
        await request(getNetworks())
      }
    } catch (e) {
      if ((e as HttpResponse<void>)?.status !== 401) {
        setNotification({
          type: 'danger',
          children: 'Failed to connect, please try again later',
          duration: 3000,
        })
      }
    }
    setLoadingId((loadingId) => [...loadingId.filter((id) => id !== networkId)])
  }
  const [loadingId, setLoadingId] = useState<string[]>([])

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
              <Trans>{statusChip?.[network?.status ?? 'UNKNOWN']?.label ?? cellValue}</Trans>
            </Chip>
          )
        case 'action':
          const iconProps = { width: 16, height: 16 }
          const onOpen = () => network?.id && setSelectedKeys(new Set([network.id]))
          const onClose = () => {
            // setSelectedKeys(new Set([]))
            clearHoverState()
          }
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
                  <Button isIconOnly size="sm" variant="light" isLoading={loadingId.includes(network?.id ?? '')}>
                    <VerticalDotIcon className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Actions">
                  <DropdownItem
                    key="details"
                    startContent={<InfoIcon {...iconProps} />}
                    title={<Trans>Details</Trans>}
                    onPress={openDetailsModal}
                  />
                  {network.status === 'DISCONNECTED' ? (
                    <DropdownItem
                      key="connect"
                      className="text-success"
                      variant="flat"
                      startContent={<ConnectIcon {...iconProps} />}
                      title={<Trans>Connect</Trans>}
                      onPress={() => request(connect(network.id))}
                    />
                  ) : (
                    <DropdownItem
                      key="disconnect"
                      className="text-danger"
                      variant="flat"
                      startContent={<DisconnectIcon {...iconProps} />}
                      title={<Trans>Disconnect</Trans>}
                      onPress={() => request(disconnect(network.id))}
                    />
                  )}
                  <DropdownItem
                    key="delete"
                    className={network.status === 'DISCONNECTED' ? 'text-danger' : 'hidden'}
                    variant="flat"
                    startContent={<TrashIcon {...iconProps} />}
                    title={<Trans>Delete</Trans>}
                    onPress={() =>
                      network.status === 'DISCONNECTED' && network.id && request(deleteNetwork(network.id))
                    }
                  />
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        default:
          return <CopyText copyValue={cellValue}>{cellValue}</CopyText>
      }
    },
    [networks, loadingId],
  )

  const clearHoverState = () => {
    tableRef.current?.querySelectorAll('tr').forEach((tr) => {
      tr.dataset.hover = ''
    })
  }

  const [selectedKeys, setSelectedKeys] = useState<Set<string | number> | 'all'>()
  const [selectedNetwork, setSelectedNetwork] = useState<Network>()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  return (
    <div className="overflow-x-auto">
      <Table
        ref={tableRef}
        aria-label="Network List"
        removeWrapper
        color="primary"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        classNames={{
          td: ['whitespace-nowrap'],
          table: isLoading ? ['min-h-[65vh]'] : [],
          loadingWrapper: ['h-[65vh]'],
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} maxWidth={column.maxWidth}>
              <Trans>{column.label}</Trans>
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={networks}
          loadingContent={
            <div className="w-full flex flex-col justify-center items-center gap-4 h-[50vh]">
              <Spinner label={t('Loading...')} color="primary" />
            </div>
          }
          emptyContent={
            <div className="flex flex-col justify-center gap-4 h-[50vh]">
              <span><Trans>No networks to display.</Trans></span>
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
