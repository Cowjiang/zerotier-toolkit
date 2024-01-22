import { create } from 'zustand'
import { InvokeEvent, ServiceStatus } from '../typings/enum.ts'
import { invokeCommand } from '../utils/tauriHelpers.ts'
import { insertLog } from '../utils/logHelpers.ts';

export type ZeroTierState = {
  serviceState: ServiceStatus
}

export type ZeroTierAction = {
  getServiceState: () => Promise<ServiceStatus>,
  startService: () => Promise<ServiceStatus>,
  stopService: () => Promise<ServiceStatus>
}

export const useZeroTierStore = create<ZeroTierState & ZeroTierAction>()((set) => ({
  serviceState: ServiceStatus.UNKNOWN,
  getServiceState: async () => {
    const {data: serviceState} = await invokeCommand(InvokeEvent.GET_SERVICE_STATE)
    set((state) => ({...state, serviceState}))
    insertLog(`Service status: ${serviceState}`)
    return serviceState
  },
  startService: async () => {
    const {data: serviceState} = await invokeCommand(InvokeEvent.START_ZEROTIER)
    set((state) => ({...state, serviceState}))
    insertLog(`Starting Service`)
    await useZeroTierStore.getState().getServiceState()
    return serviceState
  },
  stopService: async () => {
    const {data: serviceState} = await invokeCommand(InvokeEvent.STOP_ZEROTIER)
    set((state) => ({...state, serviceState}))
    insertLog(`Stopping Service`)
    await useZeroTierStore.getState().getServiceState()
    return serviceState
  },
}))
