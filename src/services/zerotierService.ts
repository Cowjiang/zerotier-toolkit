import { Network, Peer, Status } from '../typings/zerotier.ts'
import { zerotierService } from '../utils/helpers/zerotierHelpers.ts'

const getNetworks = () => zerotierService.get<Network[]>('/network')

const getStatus = () => zerotierService.get<Status>('/status')

const joinOrUpdateNetwork = (networkId: string) => zerotierService.post<Network, Network>(`/network/${networkId}`)

const leaveNetwork = (networkId: string) => zerotierService.delete(`/network/${networkId}`)

const getPeers = () => zerotierService.get<Peer[]>('/peer')

export { getNetworks, getPeers, getStatus, joinOrUpdateNetwork, leaveNetwork }
