import type { AppConfig } from '../../typings/config.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { invokeCommand } from './tauriHelpers.ts'
export const CONFIGURATIONS_SYSTEM = 'system'
export const CONFIGURATIONS_AUTH = 'auth'
export const getSystemConfig = async () => {
  return await getConfig(CONFIGURATIONS_SYSTEM)
}
export const getAuthConfig = async () => {
  return await getConfig(CONFIGURATIONS_AUTH)
}
export const getConfig = async (name = 'system'): Promise<AppConfig> => {
  const config = (await invokeCommand(InvokeEvent.GET_CONFIGURATIONS, { name }))?.data || {}
  return deserializeConfig(config)
}

export const updateSystemConfig = async (config: AppConfig) => {
  return await updateConfig(CONFIGURATIONS_SYSTEM, config)
}

export const updateConfig = async (name = CONFIGURATIONS_SYSTEM, config: AppConfig) => {
  const configString = serializeConfig(config)
  return await invokeCommand(InvokeEvent.PUT_CONFIGURATIONS, { name, payload: configString })
}
const serializeConfig = (config: AppConfig) => {
  return JSON.stringify(Object.fromEntries(Object.entries(config).map(([key, value]) => [key, String(value)])))
}

const deserializeConfig = (config: { [key: string]: string }) => {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      if (value === 'true' || value === 'false') {
        return [key, value === 'true']
      } else if (!isNaN(Number(value))) {
        return [key, Number(value)]
      } else {
        return [key, value]
      }
    }),
  )
}
