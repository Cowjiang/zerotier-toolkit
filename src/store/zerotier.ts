import { create } from 'zustand'
import { InvokeEvent, ServiceStartType, ServiceStatus } from '../typings/enum.ts'
import { invokeCommand } from '../utils/tauriHelpers.ts'
import { insertLog } from '../utils/logHelpers.ts'

export type ZeroTierState = {
  serviceState: ServiceStatus
  serviceStartType: ServiceStartType
}

export type ZeroTierAction = {
  getServiceState: () => Promise<ServiceStatus>,
  startService: () => Promise<ServiceStatus>,
  stopService: () => Promise<ServiceStatus>,
  getServiceStartType: () => Promise<ServiceStartType>,
  setServiceStartType: (serviceStartType: ServiceStartType) => Promise<boolean>
}

export const useZeroTierStore = create<ZeroTierState & ZeroTierAction>()((set) => ({
  serviceState: ServiceStatus.UNKNOWN,
  serviceStartType: ServiceStartType.DEMAND_START,
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
  getServiceStartType: async () => {
    const {data: serviceStartType} = await invokeCommand(InvokeEvent.GET_SERVICE_START_TYPE)
    set((state) => ({...state, serviceStartType}))
    insertLog(`Service start type: ${serviceStartType}`)
    return serviceStartType
  },
  setServiceStartType: async (startType: ServiceStartType) => {
    const {success} = await invokeCommand(InvokeEvent.SET_SERVICE_START_TYPE, {startType})
    insertLog(`Changed service start type to: ${startType}`)
    return success
  }
}))
