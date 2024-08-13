import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { getNetworks, getStatus, leaveNetwork } from '../services/zerotierService.ts'
import { ConfigType, ZeroTierConfig, ZerotierConfig } from '../typings/config.ts'
import { InvokeEvent, ServiceStartType, ServiceStatus } from '../typings/enum.ts'
import { Network, ServerInfo, Status } from '../typings/zerotier.ts'
import { createConfigStorage } from '../utils/helpers/configHelpers.ts'
import { invokeCommand } from '../utils/helpers/tauriHelpers.ts'

export type ZeroTierState = {
  serviceState: ServiceStatus
  serviceStartType: ServiceStartType
  serverInfo: ServerInfo
  networks: Network[]
  status: Status
  config: ZeroTierConfig
}

export type ZeroTierAction = {
  getServiceState: () => Promise<ServiceStatus>
  startService: () => Promise<ServiceStatus>
  stopService: () => Promise<ServiceStatus>
  getServiceStartType: () => Promise<ServiceStartType>
  setServiceStartType: (serviceStartType: ServiceStartType) => Promise<boolean>
  getServerInfo: () => Promise<ServerInfo>
  getNetworks: () => Promise<Network[]>
  disconnectNetwork: (networkId: string) => Promise<void>
  getStatus: () => Promise<Status>
  setConfig: (config: Partial<ZeroTierConfig>) => void
}

export const useZeroTierStore = create<ZeroTierState & ZeroTierAction>()(
  persist(
    (set, get) => ({
      serviceState: ServiceStatus.UNKNOWN,
      serviceStartType: ServiceStartType.DEMAND_START,
      serverInfo: {},
      networks: [],
      status: {},
      config: {},
      getServiceState: async () => {
        const { data: serviceState } = await invokeCommand(InvokeEvent.GET_SERVICE_STATE)
        set((state) => ({ ...state, serviceState }))
        return serviceState
      },
      startService: async () => {
        const { data: serviceState } = await invokeCommand(InvokeEvent.START_ZEROTIER)
        set((state) => ({ ...state, serviceState }))
        await useZeroTierStore.getState().getServiceState()
        return serviceState
      },
      stopService: async () => {
        const { data: serviceState } = await invokeCommand(InvokeEvent.STOP_ZEROTIER)
        set((state) => ({ ...state, serviceState }))
        await useZeroTierStore.getState().getServiceState()
        return serviceState
      },
      getServiceStartType: async () => {
        const { data: serviceStartType } = await invokeCommand(InvokeEvent.GET_SERVICE_START_TYPE)
        set((state) => ({ ...state, serviceStartType }))
        return serviceStartType
      },
      setServiceStartType: async (startType: ServiceStartType) => {
        const { success } = await invokeCommand(InvokeEvent.SET_SERVICE_START_TYPE, { startType })
        success && set((state) => ({ ...state, serviceStartType: startType }))
        return success
      },
      getServerInfo: async () => {
        const { data: serverInfo } = await invokeCommand(InvokeEvent.GET_ZEROTIER_SERVER_INFO)
        set((state) => ({ ...state, serverInfo }))
        return serverInfo
      },
      getNetworks: async () => {
        const { data: networks } = await getNetworks()
        const { [ZerotierConfig.NETWORKS]: networksHistory } = get().config
        const mergedNetworks = [
          ...networks,
          ...(networksHistory || []).filter((network) => !networks.find(({ id }) => id === network.id)),
        ]
        set((state) => ({ ...state, networks: mergedNetworks }))
        set((state) => ({ ...state, config: { ...state.config, [ZerotierConfig.NETWORKS]: mergedNetworks } }))
        return networks
      },
      disconnectNetwork: async (networkId: string) => {
        await leaveNetwork(networkId)
        const { networks } = get()
        const newNetworks = networks.map((network) => {
          if (network.id === networkId) {
            network.status = 'DISCONNECTED'
          }
          return network
        })
        set((state) => ({ ...state, networks: newNetworks }))
        set((state) => ({ ...state, config: { ...state.config, [ZerotierConfig.NETWORKS]: newNetworks } }))
      },
      getStatus: async () => {
        const { data: status } = await getStatus()
        set((state) => ({ ...state, status }))
        return status
      },
      setConfig: (config) => {
        set((state) => ({ ...state, config: { ...state.config, ...config } }))
      },
    }),
    {
      name: 'zerotierConfig',
      partialize: (state) => ({ config: state.config }),
      storage: createJSONStorage(() => createConfigStorage<ZeroTierConfig>(ConfigType.ZEROTIER)),
    },
  ),
)
