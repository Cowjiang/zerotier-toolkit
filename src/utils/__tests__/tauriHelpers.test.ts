import { mockIPC } from '@tauri-apps/api/mocks'

import { invokeCommand } from '../tauriHelpers'

describe('Tauri helpers', () => {
  it('should invoke command', async () => {
    mockIPC((cmd, args) => {
      if (cmd === 'invokeCommandTest') {
        return JSON.stringify({ code: 0, data: args.data })
      }
    })
    const { success, data } = await invokeCommand('invokeCommandTest', {
      data: 'success',
    })
    expect(success).toBeTruthy()
    expect(data).toBe('success')
  })
})
