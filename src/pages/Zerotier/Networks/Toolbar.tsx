import { Button, Input, useDisclosure } from '@heroui/react'
import { t } from 'i18next'
import { Trans } from 'react-i18next'

import { PlusIcon, SearchIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import NetworkJoinModal from './NetworkJoinModal.tsx'

function Toolbar({
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
        placeholder={t('Search by Network ID...')}
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
        <Trans>Join New</Trans>
      </Button>
      <NetworkJoinModal isOpen={isModalOpen} backdrop="blur" onOpenChange={onModalOpenChange} onClose={onModalClose} />
    </div>
  )
}

export default Toolbar
