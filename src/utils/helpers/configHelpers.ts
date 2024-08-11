import { StateStorage, StorageValue } from 'zustand/middleware'

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

export const createConfigStorage = <T extends AppConfig | ZeroTierConfig>(configType: ConfigType): StateStorage => {
  const isTauri = !!window.__TAURI_IPC__
  let configTemp = ''
  return {
    getItem: async () => {
      const value = {
        state: {
          config: {},
        },
        version: 0,
      }
      if (isTauri) {
        value.state.config = await getConfig<T>(configType)
      }
      return JSON.stringify(value)
    },
    setItem: async (_, value) => {
      const {
        state: { config },
      }: StorageValue<{ config: T }> = JSON.parse(value)
      const configString = JSON.stringify(config)
      if (configTemp !== configString && isTauri) {
        configTemp = configString
        await updateConfig(configType, config)
      }
    },
    removeItem: (): void | Promise<void> => undefined,
  }
}

const serializeConfig = (config: AppConfig | ZeroTierConfig) => {
  return JSON.stringify(Object.fromEntries(Object.entries(config).map(([key, value]) => [key, String(value)])))
}

const deserializeConfig = (config: { [key: string]: string }) => {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      if (value === 'true' || value === 'false') {
        return [key, value === 'true']
      } else if (value !== '' && !isNaN(Number(value))) {
        return [key, Number(value)]
      } else {
        return [key, value]
      }
    }),
  )
}
