import type { AppConfig } from '../../typings/config.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { invokeCommand } from './tauriHelpers.ts'

export const updateConfig = async (config: AppConfig) => {
  const configString = serializeConfig(config)
  return await invokeCommand(InvokeEvent.PUT_CONFIG_COMMAND, { payload: configString })
}

export const getConfig = async (): Promise<AppConfig> => {
  const config = (await invokeCommand(InvokeEvent.GET_CONFIG))?.data || {}
  return deserializeConfig(config)
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
