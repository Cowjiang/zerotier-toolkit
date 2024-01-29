import { mockIPC } from '@tauri-apps/api/mocks'
import { expect, test } from 'vitest'

import { invokeCommand } from '../tauriHelpers'

test('invoke command', async () => {
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
