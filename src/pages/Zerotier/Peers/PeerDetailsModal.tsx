import { Chip, Divider, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import CopyText from '../../../components/base/CopyText.tsx'
import { CopyIcon } from '../../../components/base/Icon.tsx'
import { Path, Peer } from '../../../typings/zerotier.ts'
import { activePaths, connectionChip, isRootPeer, peerConnection, peerLastReceive, peerLatency } from './peerHelpers.ts'

const formatTime = (timestamp?: number) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-tiny font-bold uppercase">
        <Trans>{label}</Trans>
      </p>
      <small className="text-default-500">{children}</small>
    </div>
  )
}

function PathItem({ path }: { path: Path }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-medium bg-default-100 p-2.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <CopyText copyValue={path.address} className="min-w-0 font-mono text-small">
          <span className="block max-w-[360px] truncate" title={path.address}>
            {path.address ?? '-'}
          </span>
        </CopyText>
        <div className="ml-auto flex flex-shrink-0 gap-1">
          {path.active && (
            <Chip size="sm" variant="flat" color="success">
              <Trans>Active</Trans>
            </Chip>
          )}
          {path.preferred && (
            <Chip size="sm" variant="flat" color="primary">
              <Trans>Preferred</Trans>
            </Chip>
          )}
          {path.expired && (
            <Chip size="sm" variant="flat">
              <Trans>Expired</Trans>
            </Chip>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-tiny text-default-500">
        <span>
          {t('Last send')}: {formatTime(path.lastSend)}
        </span>
        <span>
          {t('Last receive')}: {formatTime(path.lastReceive)}
        </span>
        <span>
          {t('Local socket')}: {path.localSocket ?? '-'}
        </span>
        <span>
          {t('Trusted path ID')}: {path.trustedPathId ?? '-'}
        </span>
      </div>
    </div>
  )
}

function PeerDetailsModal({ peer, onClose }: { peer?: Peer; onClose: () => void }) {
  const { t } = useTranslation()

  if (!peer) {
    return null
  }

  const connection = peerConnection(peer)
  const latency = peerLatency(peer)
  const version = peer.version && !peer.version.startsWith('-') ? peer.version : '-'
  const paths = [...(peer.paths ?? [])].sort(
    (a, b) =>
      Number(b.preferred ?? false) - Number(a.preferred ?? false) ||
      Number(b.active ?? false) - Number(a.active ?? false) ||
      Number(a.expired ?? false) - Number(b.expired ?? false),
  )
  const connectionLabel = isRootPeer(peer) ? t('Root server') : t(connectionChip[connection].label)

  return (
    <Modal
      isOpen
      scrollBehavior="inside"
      size="lg"
      classNames={{ base: 'max-h-[85vh]', wrapper: 'overflow-hidden' }}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <Trans>Peer details</Trans>
          <CopyText copyValue={peer.address} className="w-fit text-tiny font-normal text-default-600">
            <span className="flex items-center gap-1">
              {peer.address}
              <CopyIcon width={14} className="text-default-600" />
            </span>
          </CopyText>
        </ModalHeader>
        <ModalBody className="pb-4">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Role">
              <Chip size="sm" variant="flat" className="bg-default-100">
                {peer.role ?? t('Unknown')}
              </Chip>
            </DetailItem>
            <DetailItem label="Connection">
              <Chip size="sm" variant="flat" color={isRootPeer(peer) ? 'default' : connectionChip[connection].color}>
                {connectionLabel}
              </Chip>
            </DetailItem>
            <DetailItem label="Latency">{latency === undefined ? '-' : `${latency} ms`}</DetailItem>
            <DetailItem label="Version">{version}</DetailItem>
            <DetailItem label="Last receive">{formatTime(peerLastReceive(peer))}</DetailItem>
            <DetailItem label="Paths">{activePaths(peer).length}</DetailItem>
            {peer.isBonded && (
              <DetailItem label="Bonded">
                <Trans>Enabled</Trans>
              </DetailItem>
            )}
          </div>
          {!isRootPeer(peer) && connection !== 'direct' && (
            <p className="text-tiny text-default-500">
              <Trans>Relayed traffic goes through a root server.</Trans>
            </p>
          )}
          <Divider className="my-2" />
          <div className="flex items-center justify-between">
            <p className="text-tiny font-bold uppercase">
              <Trans>Paths</Trans>
            </p>
            {paths.length > 1 && (
              <span className="text-tiny text-default-600">
                <Trans>Scroll to view all paths</Trans>
              </span>
            )}
          </div>
          {paths.length ? (
            <div className="flex flex-col gap-2 pb-2">
              {paths.map((path, index) => (
                <PathItem key={`${path.address}-${index}`} path={path} />
              ))}
            </div>
          ) : (
            <small className="text-default-500">
              <Trans>No path</Trans>
            </small>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PeerDetailsModal
