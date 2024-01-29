import { useAppStore } from '../../store/app'
import { insertLog } from '../logHelpers'

describe('Log helpers', () => {
  it('should insert log', () => {
    insertLog('log test content')
    const appLogs = useAppStore.getState().logs
    expect(appLogs[0].content).toBe('log test content')
  })
})
