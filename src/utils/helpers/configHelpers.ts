import { AppConfig, ConfigType, ZeroTierConfig } from '../../typings/config.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { invokeCommand } from './tauriHelpers.ts'

export const getConfig = async <T extends AppConfig | ZeroTierConfig>(name: ConfigType): Promise<T> => {
  const config = (await invokeCommand(InvokeEvent.GET_CONFIGURATIONS, { name }))?.data || {}
  return deserializeConfig(config)
}

export const updateConfig = async (name: ConfigType, config: AppConfig | ZeroTierConfig) => {
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
