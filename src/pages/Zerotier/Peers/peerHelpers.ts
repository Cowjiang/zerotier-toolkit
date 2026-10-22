import { ChipProps } from '@heroui/react'

import { Peer } from '../../../typings/zerotier.ts'

export type PeerConnection = 'direct' | 'relayed' | 'tunneled' | 'idle'

export const connectionChip: Record<PeerConnection, { label: string; color: ChipProps['color'] }> = {
  direct: { label: 'Direct', color: 'success' },
  relayed: { label: 'Relayed', color: 'warning' },
  tunneled: { label: 'Tunneled', color: 'danger' },
  idle: { label: 'Idle', color: 'default' },
}

export const isRootPeer = (peer: Peer) => peer.role === 'PLANET' || peer.role === 'MOON'

export const activePaths = (peer: Peer) => (peer.paths ?? []).filter((path) => path.active && !path.expired)

export const peerConnection = (peer: Peer): PeerConnection => {
  if (peer.tunneled) {
    return 'tunneled'
  }
  if (activePaths(peer).length) {
    return 'direct'
  }
  return isRootPeer(peer) ? 'idle' : 'relayed'
}

export const peerLatency = (peer: Peer) =>
  typeof peer.latency === 'number' && peer.latency >= 0 ? peer.latency : undefined

export const peerLastReceive = (peer: Peer) =>
  (peer.paths ?? []).reduce<number | undefined>((latest, path) => {
    if (!path.lastReceive) {
      return latest
    }
    return latest === undefined || path.lastReceive > latest ? path.lastReceive : latest
  }, undefined)
