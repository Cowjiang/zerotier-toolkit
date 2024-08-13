import { Button, Input, useDisclosure } from '@nextui-org/react'

import { PlusIcon, SearchIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import JoinModal from './JoinModal.tsx'

function ToolBar({
  filterValue,
  onFilterValueChange,
  isLoading,
  onRefresh,
}: {
  filterValue: string
  onFilterValueChange?: (value: string) => void
  isLoading?: boolean
  onRefresh?: () => void
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
      {!!networks.length && (
        <RefreshButton
          buttonProps={{ className: 'flex-shrink-0 bg-default-100', variant: 'flat' }}
          isLoading={isLoading}
          onRefresh={onRefresh}
        />
      )}
      <Button className="flex-shrink-0 " color="warning" endContent={<PlusIcon />} onPress={onModalOpen}>
        Join New
      </Button>
      <JoinModal isOpen={isModalOpen} backdrop="blur" onOpenChange={onModalOpenChange} onClose={onModalClose} />
    </div>
  )
}

export default ToolBar
