import { expect } from 'vitest'

import { ZEROTIER_SERVICE_HOST } from '../../../constant.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { zerotierService } from '../zerotierHelpers.ts'

describe('Zerotier Helpers', () => {
  it('should throw an error if service info is missing or invalid', async () => {
    useZeroTierStore.setState({ serverInfo: {} })
    const test = async () => {
      await zerotierService.get('/test').catch((e) => Promise.reject(e))
    }
    expect(test).rejects.toThrowError('Invalid port or secret for the ZeroTier service')
  })

  it('should make a request within port and secret', async () => {
    const { status, url } = await zerotierService.get('/test')
    expect(url).toBe(`${ZEROTIER_SERVICE_HOST}:9999/test`)
    expect(status).toBe(200)
  })
})
