import { Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import { t } from 'i18next'
import { useCallback, useState } from 'react'
import { Trans } from 'react-i18next'

import CopyText from '../../../components/base/CopyText.tsx'
import { RefreshIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { Path, Peer } from '../../../typings/zerotier.ts'

const columns = [
  { key: 'address', label: 'ADDRESS' },
  { key: 'role', label: 'ROLE' },
  { key: 'version', label: 'VERSION', align: 'end' as const },
  { key: 'path', label: 'PATH' },
  { key: 'lastReceive', label: 'LAST RECEIVE', align: 'end' as const },
]

const roleText: Record<string, string> = {
  PLANET: 'text-primary',
  MOON: 'text-secondary',
  LEAF: 'text-default-600',
}

const roleWeight: Record<string, number> = {
  PLANET: 0,
  MOON: 1,
  LEAF: 2,
}

const sortPeers = (peers: Peer[]) =>
  [...peers].sort(
    (a, b) =>
      (roleWeight[a.role ?? ''] ?? 3) - (roleWeight[b.role ?? ''] ?? 3) ||
      (a.address ?? '').localeCompare(b.address ?? ''),
  )

const runningPath = (peer: Peer): Path | undefined => peer.paths?.find((path) => path.active) ?? peer.paths?.[0]

// the planets report their version as -1.-1.-1
const knownVersion = (version?: string) => (version && !version.startsWith('-') ? version : '-')

const elapsed = (timestamp?: number) => {
  if (!timestamp) {
    return '-'
  }
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 1) {
    return t('now')
  }
  if (seconds < 60) {
    return `${seconds}s`
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`
  }
  return `${Math.floor(seconds / 86400)}d`
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
  const sortedPeers = sortPeers(peers)
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number> | 'all'>()

  const renderCell = useCallback((peer: Peer, columnKey: string) => {
    switch (columnKey) {
      case 'role':
        return (
          <Chip
            size="sm"
            variant="flat"
            className="bg-default-100"
            classNames={{ content: roleText[peer.role ?? ''] ?? 'text-default-600' }}
          >
            {peer.role ?? t('Unknown')}
          </Chip>
        )
      case 'version':
        return knownVersion(peer.version)
      case 'path':
        return (
          <CopyText
            className={runningPath(peer)?.address ? 'font-mono' : 'text-default-500'}
            copyValue={runningPath(peer)?.address}
          >
            <span className="block max-w-[170px] truncate" title={runningPath(peer)?.address}>
              {runningPath(peer)?.address ?? t('No path')}
            </span>
          </CopyText>
        )
      case 'lastReceive':
        return elapsed(runningPath(peer)?.lastReceive)
      default:
        return (
          <CopyText className="font-mono" copyValue={peer.address}>
            {peer.address}
          </CopyText>
        )
    }
  }, [])

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <Table
        aria-label="Peer List"
        removeWrapper
        color="primary"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        classNames={{
          th: ['px-2'],
          td: ['whitespace-nowrap', 'px-2'],
          table: isLoading ? ['min-h-[65vh]'] : [],
          loadingWrapper: ['h-[65vh]'],
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
            <div className="w-full flex flex-col justify-center items-center gap-4 h-[50vh]">
              <Spinner label={t('Loading...')} color="primary" />
            </div>
          }
          emptyContent={
            <div className="flex flex-col justify-center gap-4 h-[50vh]">
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
            <TableRow key={peer.address}>
              {(columnKey) => (
                <TableCell
                  className={
                    columnKey === 'version' || columnKey === 'lastReceive' ? 'text-right tabular-nums' : undefined
                  }
                >
                  {renderCell(peer, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PeersTable
