import { create } from 'zustand'
import { invokeCommand } from '../utils/tauriHelpers.ts'
import { InvokeEvent } from '../typings/enum.ts'
import type { Log } from '../utils/logHelpers.ts'

export type AppState = {
  isLoading: boolean
  isAdmin: boolean
  logs: Log[]
}

export type AppAction = {
  setLoading: (loading: boolean) => void
  checkAdmin: () => Promise<boolean>
  insertLog: (content: string) => void
}

export const useAppStore = create<AppState & AppAction>()((set) => ({
  isLoading: true,
  isAdmin: false,
  logs: [],
  setLoading: (loading) => set((state) => ({...state, isLoading: loading})),
  checkAdmin: async () => {
    const {data: isAdmin} = await invokeCommand(InvokeEvent.IS_ADMIN)
    set((state) => ({...state, isAdmin}))
    return isAdmin
  },
  insertLog: (content) => set((state) => ({
    ...state, logs: [...state.logs, {
      timestamp: Date.now(),
      content
    }]
  }))
}))
