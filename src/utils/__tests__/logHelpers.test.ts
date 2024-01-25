import { test, expect } from 'vitest'
import { insertLog } from '../logHelpers'
import { useAppStore } from '../../store/app'

test('insert log', () => {
  insertLog('log test content')
  const appLogs = useAppStore.getState().logs
  expect(appLogs[0].content).toBe('log test content')
})
