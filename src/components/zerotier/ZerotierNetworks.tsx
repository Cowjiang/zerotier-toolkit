import {
  Button,
  ButtonProps,
  Chip,
  ChipProps,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumnProps,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react'
import { Key, useCallback, useEffect, useState } from 'react'

import { joinNetwork, leaveNetwork } from '../../services/zerotierService.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { Network, NetworkStatus } from '../../typings/zerotier.ts'
import { DisconnectIcon, InfoIcon, PlusIcon, RefreshIcon, SearchIcon, VerticalDotIcon } from '../base/Icon.tsx'
import NotificationBar from '../base/NotificationBar.tsx'
import { useNotification } from '../providers/NotificationProvider.tsx'

function JoinModal(props: Omit<ModalProps, 'children'>) {
  const { onClose } = props
  const [inputValue, setInputValue] = useState('')
  const { setNotification } = useNotification()

  const onModalClose = () => {
    setInputValue('')
    onClose?.()
  }

  const [joining, setJoining] = useState(false)
  const onJoinBtnClick = async () => {
    setJoining(true)
    try {
      await joinNetwork(inputValue)
      onModalClose()
    } catch (e) {
      setNotification({
        type: 'warning',
        children: 'Failed to join network, please check your Network ID',
        duration: 3000,
      })
    } finally {
      setTimeout(() => setJoining(false), 300)
    }
  }

  return (
    <Modal {...props} onClose={onModalClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Join New Network</ModalHeader>
        <ModalBody>
          <Input
            isClearable
            className="w-full"
            label="Enter 16-digit Network ID"
            value={inputValue}
            maxLength={16}
            onClear={() => setInputValue('')}
            onValueChange={(value) => setInputValue(value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onModalClose}>
            Cancel
          </Button>
          <Button color="warning" isLoading={joining} isDisabled={inputValue.length < 16} onPress={onJoinBtnClick}>
            Join
          </Button>
        </ModalFooter>
        <NotificationBar />
      </ModalContent>
    </Modal>
  )
}

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

function ToolBar({
  // editMode,
  // onEditChange,
  filterValue,
  onFilterValueChange,
}: {
  editMode?: boolean
  onEditChange?: () => void
  filterValue: string
  onFilterValueChange?: (value: string) => void
}) {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange,
    onClose: onModalClose,
  } = useDisclosure()
  const { networks } = useZeroTierStore()

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
      {!!networks.length && <RefreshButton className="flex-shrink-0" variant="flat" />}
      {/*<Button*/}
      {/*  className="flex-shrink-0"*/}
      {/*  color={editMode ? 'warning' : 'default'}*/}
      {/*  variant="flat"*/}
      {/*  onPress={() => onEditChange?.()}*/}
      {/*>*/}
      {/*  {editMode ? 'Cancel' : 'Edit'}*/}
      {/*</Button>*/}
      <Button className="flex-shrink-0 " color="warning" endContent={<PlusIcon />} onPress={onModalOpen}>
        Join New
      </Button>
      <JoinModal isOpen={isModalOpen} backdrop="blur" onOpenChange={onModalOpenChange} onClose={onModalClose} />
    </div>
  )
}

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
    <div className="flex flex-col gap-4">
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
