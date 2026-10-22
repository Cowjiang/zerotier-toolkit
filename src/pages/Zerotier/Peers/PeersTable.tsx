import { Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { t } from 'i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans } from 'react-i18next'

import { RefreshIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { Peer } from '../../../typings/zerotier.ts'
import PeerDetailsModal from './PeerDetailsModal.tsx'
import { activePaths, connectionChip, isRootPeer, PeerConnection, peerConnection, peerLatency } from './peerHelpers.ts'

const columns = [
  { key: 'address', label: 'ADDRESS' },
  { key: 'role', label: 'ROLE' },
  { key: 'connection', label: 'CONNECTION' },
  { key: 'latency', label: 'LATENCY', align: 'end' as const },
  { key: 'path', label: 'PATH' },
]

const roleText: Record<string, string> = {
  PLANET: 'text-primary',
  MOON: 'text-secondary',
  LEAF: 'text-default-600',
}

const roleWeight: Record<string, number> = { LEAF: 0, MOON: 1, PLANET: 2 }
const connectionWeight: Record<PeerConnection, number> = { relayed: 0, tunneled: 0, idle: 1, direct: 2 }

const latencyClass = (latency: number) => {
  if (latency >= 150) {
    return 'text-danger'
  }
  if (latency >= 80) {
    return 'text-warning'
  }
  return 'text-success'
}

function PeersTable({
  peers,
  isLoading,
  isError,
  isRefreshing,
  onRefresh,
}: {
  peers: Peer[]
  isLoading?: boolean
  isError?: boolean
  isRefreshing?: boolean
  onRefresh?: () => void
}) {
  const sortedPeers = [...peers].sort((a, b) => {
    const role = (roleWeight[a.role ?? ''] ?? 3) - (roleWeight[b.role ?? ''] ?? 3)
    if (role) {
      return role
    }
    const connection = connectionWeight[peerConnection(a)] - connectionWeight[peerConnection(b)]
    if (connection) {
      return connection
    }
    const latencyA = peerLatency(a) ?? -1
    const latencyB = peerLatency(b) ?? -1
    if (latencyA !== latencyB) {
      return latencyB - latencyA
    }
    return (a.address ?? '').localeCompare(b.address ?? '')
  })
  const [selectedPeer, setSelectedPeer] = useState<Peer>()
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number> | 'all'>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const openPeer = (keys: Set<string | number> | 'all') => {
    if (keys === 'all') {
      return
    }
    const key = Array.from(keys)[0]
    setSelectedPeer(peers.find(({ address }) => address === String(key)))
    setSelectedKeys(new Set())
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!selectedPeer || !scrollContainer) {
      return
    }
    const preventBackgroundWheel = (event: WheelEvent) => {
      event.preventDefault()
    }
    scrollContainer.addEventListener('wheel', preventBackgroundWheel, { passive: false })
    return () => scrollContainer.removeEventListener('wheel', preventBackgroundWheel)
  }, [selectedPeer])

  const renderCell = useCallback((peer: Peer, columnKey: string) => {
    switch (columnKey) {
      case 'role':
        return (
          <Chip
            size="sm"
            variant="flat"
            className={peer.role === 'LEAF' ? 'bg-default-200' : 'bg-default-100'}
            classNames={{ content: roleText[peer.role ?? ''] ?? 'text-default-600' }}
          >
            {peer.role ?? t('Unknown')}
          </Chip>
        )
      case 'connection': {
        if (isRootPeer(peer)) {
          return (
            <Chip size="sm" variant="flat">
              {t('Root server')}
            </Chip>
          )
        }
        const connection = connectionChip[peerConnection(peer)]
        return (
          <Chip size="sm" variant="flat" color={connection.color}>
            {t(connection.label)}
          </Chip>
        )
      }
      case 'latency': {
        const latency = peerLatency(peer)
        return latency === undefined ? (
          <span className="text-default-500">-</span>
        ) : (
          <span className={latencyClass(latency)}>{latency} ms</span>
        )
      }
      case 'path': {
        const paths = activePaths(peer)
        const path = paths.find((path) => path.preferred) ?? paths[0]
        return (
          <div className="flex flex-col">
            <span
              className={path?.address ? 'block max-w-[160px] truncate font-mono' : 'block text-default-500'}
              title={path?.address}
            >
              {path?.address ?? t('No path')}
            </span>
            {!isRootPeer(peer) && paths.length > 1 && (
              <span className="text-tiny text-default-500">{t('{{count}} paths', { count: paths.length })}</span>
            )}
          </div>
        )
      }
      default:
        return <span className="font-mono">{peer.address}</span>
    }
  }, [])

  return (
    <>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-x-auto overflow-y-scroll">
        <Table
          aria-label="Peer List"
          removeWrapper
          isHeaderSticky
          color="primary"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          onSelectionChange={openPeer}
          classNames={{
            thead: ['after:bg-background'],
            th: ['px-2'],
            td: ['whitespace-nowrap', 'px-2'],
            table: isLoading ? ['min-h-[60vh]'] : [],
            loadingWrapper: ['h-[60vh]'],
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} align={column.align}>
                <Trans>{column.label}</Trans>
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            items={sortedPeers}
            loadingContent={
              <div className="w-full flex flex-col justify-center items-center gap-4 h-[45vh]">
                <Spinner label={t('Loading...')} color="primary" />
              </div>
            }
            emptyContent={
              <div className="flex flex-col justify-center gap-4 h-[45vh]">
                <span>
                  <Trans>{isError ? 'Failed to load peers' : 'No peers to display'}</Trans>
                </span>
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
            {sortedPeers.map((peer) => (
              <TableRow key={peer.address} className="cursor-pointer" onMouseDown={(event) => event.preventDefault()}>
                {(columnKey) => <TableCell>{renderCell(peer, columnKey as string)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PeerDetailsModal peer={selectedPeer} onClose={() => setSelectedPeer(undefined)} />
    </>
  )
}

export default PeersTable
