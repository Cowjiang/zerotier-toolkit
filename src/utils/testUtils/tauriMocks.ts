import { mockIPC } from '@tauri-apps/api/mocks'

import { AppConfig, ZeroTierConfig } from '../../typings/config.ts'
import { InvokeEvent } from '../../typings/enum.ts'

export const mockConfigIPC = (config: AppConfig | ZeroTierConfig = {}) =>
  mockIPC(async (cmd, args) => {
    if (cmd === InvokeEvent.PUT_CONFIGURATIONS) {
      return JSON.stringify({ code: 0, message: 'success', data: (args as { payload?: string })?.payload })
    }
    if (cmd === InvokeEvent.GET_CONFIGURATIONS) {
      return JSON.stringify({ code: 0, message: 'success', data: config })
    }
    return JSON.stringify({ code: 0, message: 'success', data: null })
  })

export const mockFailingIPC = (message: string) =>
  mockIPC(async () => JSON.stringify({ code: -1, message, data: null }))
