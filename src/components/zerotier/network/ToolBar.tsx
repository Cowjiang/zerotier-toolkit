import { Button, Input, useDisclosure } from '@nextui-org/react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import { PlusIcon, SearchIcon } from '../../base/Icon.tsx'
import JoinModal from './JoinModal.tsx'
import RefreshButton from './RefreshButton.tsx'

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

export default ToolBar
