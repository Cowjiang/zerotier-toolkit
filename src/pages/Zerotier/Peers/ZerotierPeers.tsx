import { Chip, Input } from '@heroui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { SearchIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import { connectionChip, peerConnection } from './peerHelpers.ts'
import PeersTable from './PeersTable.tsx'

function ZerotierPeers() {
  const { t } = useTranslation()
  const { request } = useRequest()
  const { peers, getPeers } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(!peers.length)
  const [isError, setIsError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const loadingRef = useRef(false)

  const loadPeers = useCallback(async (showSpinner = false) => {
    if (loadingRef.current) {
      return
    }
    loadingRef.current = true
    if (showSpinner) {
      setIsLoading(true)
    }
    try {
      await request(getPeers())
      setIsError(false)
    } catch {
      if (!useZeroTierStore.getState().peers.length) {
        setIsError(true)
      }
    } finally {
      loadingRef.current = false
      if (showSpinner) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadPeers(!useZeroTierStore.getState().peers.length)
  }, [loadPeers])

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadPeers()
    setTimeout(() => setIsRefreshing(false), 300)
  }, [loadPeers])

  const [filterValue, setFilterValue] = useState('')
  const filteredPeers = peers.filter((peer) => {
    const keyword = filterValue.toLowerCase()
    return (
      peer.address?.includes(keyword) ||
      peer.role?.toLowerCase().includes(keyword) ||
      peer.version?.includes(keyword) ||
      peer.paths?.some((path) => path.address?.toLowerCase().includes(keyword)) ||
      t(connectionChip[peerConnection(peer)].label).toLowerCase().includes(keyword)
    )
  })

  return (
    <div className="h-full flex flex-col gap-3">
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
