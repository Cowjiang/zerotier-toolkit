import { mockIPC } from '@tauri-apps/api/mocks'
import { beforeEach, expect } from 'vitest'

import { ZEROTIER_SERVICE_HOST } from '../../../constant.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { zerotierService } from '../zerotierHelpers.ts'

beforeEach(() => {
  mockIPC((cmd, args) => {
    if (cmd === 'tauri' && (args.message as any)?.cmd === 'httpRequest') {
      return {
        url: (args.message as any).options?.url,
        status: 200,
        ok: true,
        data: '',
      }
    }
  })
})

describe('Zerotier Helpers', () => {
  it('should throw an error if service info is missing or invalid', async () => {
    const test = async () => {
      await zerotierService.get('/test').catch((e) => Promise.reject(e))
    }
    expect(test).rejects.toThrowError('Invalid port or secret for the ZeroTier service')
  })

  it('should make a request within port and secret', async () => {
    useZeroTierStore.setState({ serverInfo: { port: 9999, secret: 'test' } })
    const { status, url } = await zerotierService.get('/test')
    expect(url).toBe(`${ZEROTIER_SERVICE_HOST}:9999/test`)
    expect(status).toBe(200)
  })
})
