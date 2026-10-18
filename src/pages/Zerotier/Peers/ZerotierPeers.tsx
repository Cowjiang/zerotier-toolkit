import { Chip, Input } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { SearchIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import PeersTable from './PeersTable.tsx'

function ZerotierPeers() {
  const { t } = useTranslation()
  const { request } = useRequest()
  const { peers, getPeers } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const init = () => {
    if (!isLoading && !peers.length) {
      setIsLoading(true)
    }
    request(getPeers())
      .then(() => setIsError(false))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }
  useEffect(init, [])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await request(getPeers())
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  const [filterValue, setFilterValue] = useState('')
  const filteredPeers = peers.filter((peer) => {
    const keyword = filterValue.toLowerCase()
    return (
      peer.address?.includes(keyword) ||
      peer.role?.toLowerCase().includes(keyword) ||
      peer.version?.includes(keyword) ||
      peer.paths?.some((path) => path.address?.toLowerCase().includes(keyword))
    )
  })

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="w-full flex items-center gap-2">
        <span className="flex-shrink-0 text-default-700">
          <Trans>Known peers</Trans>
        </span>
        <Chip size="sm" variant="flat" className="flex-shrink-0 bg-default-100">
          {filterValue ? `${filteredPeers.length}/${peers.length}` : peers.length}
        </Chip>
        <Input
          isClearable
          className="w-full"
          placeholder={t('Search peers...')}
          startContent={<SearchIcon width="18" height="18" />}
          value={filterValue}
          onClear={() => setFilterValue('')}
          onValueChange={setFilterValue}
        />
        <RefreshButton
          buttonProps={{ className: 'flex-shrink-0 bg-default-100', variant: 'flat' }}
          isLoading={isRefreshing}
          onRefresh={onRefresh}
        />
      </div>
      <PeersTable
        peers={filteredPeers}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </div>
  )
}

export default ZerotierPeers
