import { exit } from '@tauri-apps/plugin-process'
import type { DownloadEvent, Update } from '@tauri-apps/plugin-updater'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { AppConfig, ConfigType } from '../typings/config.ts'
import { InvokeEvent } from '../typings/enum.ts'
import { createConfigStorage } from '../utils/helpers/configHelpers.ts'
import { checkUpdate, invokeCommand } from '../utils/helpers/tauriHelpers.ts'

type UpdateState = {
  update: Update | null
  downloaded: number
  total: number
}

export type AppState = {
  hasHydrated: boolean
  isLoading: boolean
  showSplash: boolean
  isAdmin: boolean
  config: AppConfig
  updateState: UpdateState
}

export type AppAction = {
  setLoading: (loading: boolean) => void
  setShowSplash: (showSplash: boolean) => void
  checkAdmin: () => Promise<boolean>
  restartAsAdmin: () => Promise<void>
  setConfig: (config: Partial<AppConfig>) => void
  checkUpdate: () => Promise<Update | null>
  downloadUpdate: (update: Update) => Promise<void>
  installUpdate: (update: Update) => Promise<void>
  resetUpdate: () => void
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
      updateState: { update: null, downloaded: 0, total: 0 },
      setLoading: (loading) => set((state) => ({ ...state, isLoading: loading })),
      setShowSplash: (showSplash) => set((state) => ({ ...state, showSplash })),
      checkAdmin: async () => {
        const { data: isAdmin } = await invokeCommand(InvokeEvent.IS_ADMIN)
        set((state) => ({ ...state, isAdmin }))
        return isAdmin
      },
      restartAsAdmin: async () => {
        const { success, message } = await invokeCommand(InvokeEvent.RESTART_AS_ADMIN)
        if (!success) {
          throw message
        }
        await exit(0)
      },
      setConfig: (config) => {
        set((state) => ({ ...state, config: { ...state.config, ...config } }))
      },
      checkUpdate: async () => {
        const update = await checkUpdate()
        set((state) => ({ ...state, updateState: { update, downloaded: 0, total: 0 } }))
        return update
      },
      downloadUpdate: async (update: Update, event?: (progress: DownloadEvent) => void) => {
        let downloaded = 0
        const downloadEvent = (e: DownloadEvent) => {
          event?.(e)
          if (e.event === 'Started') {
            const total = e.data.contentLength
            total && set((state) => ({ ...state, updateState: { ...state.updateState, total } }))
            console.log('[Download Update]', 'Started downloading', total, 'bytes')
          } else if (e.event === 'Progress') {
            downloaded += e.data.chunkLength
            set((state) => ({ ...state, updateState: { ...state.updateState, downloaded } }))
          } else if (e.event === 'Finished') {
            set((state) => ({ ...state, updateState: { ...state.updateState, downloaded: state.updateState.total } }))
            console.log('[Download Update]', 'Download finished')
          }
        }
        await update.download(downloadEvent)
      },
      installUpdate: async (update: Update) => {
        console.log('[Install Update]', 'Started installing')
        await update.install()
      },
      resetUpdate: () => {
        set((state) => ({ ...state, updateState: { update: null, downloaded: 0, total: 0 } }))
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
      storage: createJSONStorage(() => createConfigStorage<AppConfig>(ConfigType.APP)),
    },
  ),
)
