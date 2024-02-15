import { useAppStore } from '../../store/app.ts'

export type Log = {
  timestamp: number
  content: string
}

export const insertLog = (content: string) => {
  useAppStore.getState().insertLog(content)
}
