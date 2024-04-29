import { exit } from '@tauri-apps/api/process'
import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage, StorageValue } from 'zustand/middleware'

import type { AppConfig } from '../typings/config.ts'
import { InvokeEvent } from '../typings/enum.ts'
import { invokeCommand, readTextFile, writeTextFile } from '../utils/helpers/tauriHelpers.ts'

export type AppState = {
  hasHydrated: boolean
  isLoading: boolean
  showSplash: boolean
  isAdmin: boolean
  config: AppConfig
}

export type AppAction = {
  setLoading: (loading: boolean) => void
  setShowSplash: (showSplash: boolean) => void
  checkAdmin: () => Promise<boolean>
  restartAsAdmin: () => Promise<void>
  setConfig: (config: Partial<AppConfig>) => void
}

const appConfigStorage = (): StateStorage => {
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
        value.state.config = JSON.parse((await readTextFile()) || '{}')
      }
      return JSON.stringify(value)
    },
    setItem: async (_, value) => {
      const {
        state: { config },
      }: StorageValue<Pick<AppState, 'config'>> = JSON.parse(value)
      const appConfig = JSON.stringify(config)
      if (configTemp !== appConfig && isTauri) {
        configTemp = appConfig
        await writeTextFile(appConfig)
      }
    },
    removeItem: (): void | Promise<void> => undefined,
  }
}

export const useAppStore = create<AppState & AppAction>()(
  persist(
    (set) => ({
      hasHydrated: false,
      isLoading: true,
      showSplash: true,
      isAdmin: false,
      logs: [],
      config: {},
      setLoading: (loading) => set((state) => ({ ...state, isLoading: loading })),
      setShowSplash: (showSplash) => set((state) => ({ ...state, showSplash })),
      checkAdmin: async () => {
        const { data: isAdmin } = await invokeCommand(InvokeEvent.IS_ADMIN)
        set((state) => ({ ...state, isAdmin }))
        return isAdmin
      },
      restartAsAdmin: async () => {
        try {
          const { success } = await invokeCommand(InvokeEvent.RESTART_AS_ADMIN)
          // TODO handle exit callback
          success && (await exit(1))
        } catch (e) {
          console.error(e)
        }
      },
      setConfig: (config) => {
        set((state) => ({ ...state, config: { ...state.config, ...config } }))
      },
    }),
    {
      name: 'appConfig',
      onRehydrateStorage: () => {
        return () => {
          useAppStore.setState({ ...useAppStore.getState(), hasHydrated: true })
        }
      },
      partialize: (state) => ({ config: state.config }),
      storage: createJSONStorage(appConfigStorage),
    },
  ),
)
