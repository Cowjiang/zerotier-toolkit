import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockServer } from '../../../../__mocks__/zerotier.ts'
import { render } from '../../../../utils/testUtils/setupTest.tsx'
import ZerotierStatus from '../ZerotierStatus.tsx'

describe('ZerotierStatus', () => {
  it('should show the address of this node', async () => {
    const { getByText } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('My Address: 7c086786bb')).toBeTruthy())
    expect(getByText(/"version": "1.14.2"/)).toBeTruthy()
  })

  it('should offer a retry when the service is unreachable', async () => {
    mockServer.use(http.get('*/status', () => HttpResponse.error()))

    const { getByText } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('Failed to get status.')).toBeTruthy())
    expect(getByText('Refresh')).toBeTruthy()
  })
})
