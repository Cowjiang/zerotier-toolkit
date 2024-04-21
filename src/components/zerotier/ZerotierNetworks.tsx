import {
  Button,
  ButtonProps,
  Chip,
  ChipProps,
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

import { joinNetwork } from '../../services/zerotierService.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { Network } from '../../typings/zerotier.ts'
import { PlusIcon, RefreshIcon, SearchIcon } from '../base/Icon.tsx'
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
  const columns: ({ label: string } & Omit<TableColumnProps<any>, 'children'>)[] = [
    { key: 'id', label: 'NETWORK ID', maxWidth: '100' },
    { key: 'name', label: 'NAME', maxWidth: '100' },
    { key: 'status', label: 'STATUS', maxWidth: '100' },
    { key: 'action', label: 'ACTION', maxWidth: '100' },
  ]

  const statusChip: Record<string, { label: string; color: ChipProps['color'] }> = {
    OK: { label: 'Connected', color: 'success' },
  }

  const renderCell = useCallback((network: Network, columnKey: Key) => {
    const cellValue = network[columnKey as keyof Network] as string | number | boolean | undefined
    switch (columnKey) {
      case 'status':
        return (
          <Chip className="capitalize" color={statusChip?.[network?.status ?? '']?.color} size="sm" variant="flat">
            {statusChip?.[network?.status ?? '']?.label ?? cellValue}
          </Chip>
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
