import { waitFor } from '@testing-library/react'
import { act } from 'react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import { zerotierService } from '../../helpers/zerotierHelpers.ts'
import { renderHook } from '../../testUtils/setupTest.tsx'
import useRequest from '../useRequest.ts'

describe('useRequest', () => {
  it('should throw an error if port or secret is invalid', async () => {
    useZeroTierStore.setState({ serverInfo: {} })
    const fetchMock = async () => await zerotierService.get('/test')

    act(() => {
      const { result } = renderHook(() => useRequest())
      waitFor(async () => {
        await expect(result.current.request(fetchMock())).rejects.toEqual({
          ok: false,
          status: 401,
          data: 'Invalid port or secret for the ZeroTier service',
        })
      })
    })
  })
})
