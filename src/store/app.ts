import { exit } from '@tauri-apps/api/process'
import { create } from 'zustand'

import { InvokeEvent } from '../typings/enum.ts'
import type { AppConfig } from '../typings/global.ts'
import type { Log } from '../utils/logHelpers.ts'
import { invokeCommand } from '../utils/tauriHelpers.ts'

export type AppState = {
  isLoading: boolean
  isAdmin: boolean
  logs: Log[]
  config: AppConfig
}

export type AppAction = {
  setLoading: (loading: boolean) => void
  checkAdmin: () => Promise<boolean>
  insertLog: (content: string) => void
  restartAsAdmin: () => Promise<void>
  getConfig: () => Promise<AppConfig>
}

export const useAppStore = create<AppState & AppAction>()((set) => ({
  isLoading: true,
  isAdmin: false,
  logs: [],
  config: {},
  setLoading: (loading) => set((state) => ({ ...state, isLoading: loading })),
  checkAdmin: async () => {
    const { data: isAdmin } = await invokeCommand(InvokeEvent.IS_ADMIN)
    set((state) => ({ ...state, isAdmin }))
    return isAdmin
  },
  insertLog: (content) =>
    set((state) => ({
      ...state,
      logs: [
        ...state.logs,
        {
          timestamp: Date.now(),
          content,
        },
      ],
    })),
  restartAsAdmin: async () => {
    try {
      const { success } = await invokeCommand(InvokeEvent.RESTART_AS_ADMIN)
      // TODO handle exit callback
      success && (await exit(1))
    } catch (e) {
      console.error(e)
    }
  },
  getConfig: async () => {
    const { data: config } = await invokeCommand(InvokeEvent.GET_CONFIG)
    set((state) => ({ ...state, config }))
    return config
  },
}))
