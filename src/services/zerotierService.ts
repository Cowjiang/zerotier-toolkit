import { Network, Peer, Status } from '../typings/zerotier.ts'
import { zerotierService } from '../utils/helpers/zerotierHelpers.ts'

const getStatus = () => zerotierService.get<Status>('/status')

const getNetworks = () => zerotierService.get<Network[]>('/network')

const getNetworkById = (networkId: string) => zerotierService.get<Network>(`/network/${networkId}`)

const joinNetwork = (networkId: string) => zerotierService.post<string, Network>(`/network/${networkId}`)

const updateNetwork = (networkId: string, networkDetails: Network) =>
  zerotierService.post<Network, Network>(`/network/${networkId}`, networkDetails)

const leaveNetwork = (networkId: string) => zerotierService.delete(`/network/${networkId}`)

const getPeers = () => zerotierService.get<Peer[]>('/peer')

const getPeerByAddress = (address: string) => zerotierService.get<Peer>(`/peer/${address}`)

export { getNetworkById, getNetworks, getPeerByAddress, getPeers, getStatus, joinNetwork, leaveNetwork, updateNetwork }
