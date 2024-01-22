import { create } from 'zustand'

interface AppState {
  isAdmin: boolean
}

type AppAction = {
  checkAdmin: () => void
}

const useAppStore = create<AppState & AppAction>()((set) => ({
    isAdmin: false,
    checkAdmin: () => set((state) => ({isAdmin: !state.isAdmin, ...state}))
  })
)
