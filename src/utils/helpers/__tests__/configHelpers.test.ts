import { mockIPC } from '@tauri-apps/api/mocks'
import { describe, expect } from 'vitest'

import { ThemeConfig } from '../../../typings/config.ts'
import { InvokeEvent, Theme } from '../../../typings/enum.ts'
import { getConfig, updateConfig } from '../configHelpers.ts'

const config = {
  [ThemeConfig.CURRENT]: Theme.LIGHT,
  [ThemeConfig.IS_SYNC_WITH_SYSTEM]: true,
}
const serializedConfig = { 'Theme.Current': 'light', 'Theme.IsSyncWithSystem': 'true' }

beforeEach(() => {
  mockIPC(async (cmd, args) => {
    if (cmd === InvokeEvent.PUT_CONFIG_COMMAND) {
      return JSON.stringify({ code: 0, data: args.payload })
    } else if (cmd === InvokeEvent.GET_CONFIG) {
      return JSON.stringify({ code: 0, data: serializedConfig })
    }
  })
})

describe('Config Helpers', () => {
  it('should serialize and update config', async () => {
    const { data } = await updateConfig(config)
    expect(data).toBe(JSON.stringify(serializedConfig))
  })

  it('should get and deserialize config', async () => {
    const deserializedConfig = await getConfig()
    expect(deserializedConfig).toMatchObject(config)
  })
})
