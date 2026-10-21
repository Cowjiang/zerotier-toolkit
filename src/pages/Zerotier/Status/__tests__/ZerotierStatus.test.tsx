import { fireEvent, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { mockServer } from '../../../../__mocks__/zerotier.ts'
import { useZeroTierStore } from '../../../../store/zerotier.ts'
import { Status } from '../../../../typings/zerotier.ts'
import { render } from '../../../../utils/testUtils/setupTest.tsx'
import ZerotierStatus from '../ZerotierStatus.tsx'

const mockStatus: Status = {
  address: '7c086786bb',
  online: true,
  version: '1.14.2',
  planetWorldId: 149604618,
  planetWorldTimestamp: 1567191349589,
  tcpFallbackActive: false,
  config: {
    settings: {
      primaryPort: 9993,
      listeningOn: ['192.168.0.3/9993'],
      surfaceAddresses: ['121.32.50.196/23882'],
      portMappingEnabled: true,
    },
  },
}

beforeEach(() => {
  mockServer.use(http.get('*/status', () => HttpResponse.json(mockStatus)))
})

describe('ZerotierStatus', () => {
  it('should show the cached status without loading again', () => {
    useZeroTierStore.setState({ status: mockStatus, statusUpdatedAt: Date.now() })

    const { getByText } = render(<ZerotierStatus />)

    expect(getByText('7c086786bb')).toBeTruthy()
    expect(getByText(/Updated at/)).toBeTruthy()
  })

  it('should show the address and the details of this node', async () => {
    const { getByText } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('7c086786bb')).toBeTruthy())
    expect(getByText('Online')).toBeTruthy()
    expect(getByText('1.14.2')).toBeTruthy()
    expect(getByText('Official · 149604618')).toBeTruthy()
    expect(getByText('Not in use')).toBeTruthy()
    expect(getByText('9993')).toBeTruthy()
    expect(getByText('192.168.0.3/9993')).toBeTruthy()
    expect(getByText('121.32.50.196/23882')).toBeTruthy()
    expect(getByText('Enabled')).toBeTruthy()
  })

  it('should show all addresses in a dialog', async () => {
    mockServer.use(
      http.get('*/status', () =>
        HttpResponse.json({
          ...mockStatus,
          config: {
            settings: {
              ...mockStatus.config?.settings,
              listeningOn: ['192.168.0.3/9993', '192.168.0.3/34151', '192.168.0.3/59923'],
              surfaceAddresses: ['121.32.50.196/23882', '121.32.50.196/23883'],
            },
          },
        }),
      ),
    )

    const { getByText, getByRole, queryByText } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('192.168.0.3/9993')).toBeTruthy())
    expect(queryByText('192.168.0.3/34151')).toBeNull()
    expect(queryByText('121.32.50.196/23883')).toBeNull()

    fireEvent.click(getByRole('button', { name: 'Show all (3)' }))
    await waitFor(() => expect(getByText('192.168.0.3/34151')).toBeTruthy())
    expect(queryByText('121.32.50.196/23883')).toBeNull()
  })

  it('should offer the peer paths when the traffic goes through the TCP relay', async () => {
    mockServer.use(http.get('*/status', () => HttpResponse.json({ ...mockStatus, tcpFallbackActive: true })))

    const { getByText } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('In use')).toBeTruthy())
    expect(getByText('Check paths')).toBeTruthy()
  })

  it('should offer the troubleshooting entry when this node lost the connection to the network', async () => {
    mockServer.use(http.get('*/status', () => HttpResponse.json({ ...mockStatus, online: false })))

    const { getByText, getByRole } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('Offline')).toBeTruthy())
    expect(getByRole('button', { name: 'Troubleshooting' })).toBeTruthy()
  })

  it('should offer the troubleshooting entry when the service is unreachable', async () => {
    mockServer.use(http.get('*/status', () => HttpResponse.error()))

    const { getByText, getByRole } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('Failed to get status.')).toBeTruthy())
    expect(getByRole('button', { name: 'Troubleshooting' })).toBeTruthy()
  })

  it('should offer the troubleshooting entry when the authentication fails', async () => {
    mockServer.use(http.get('*/status', () => HttpResponse.json({}, { status: 401 })))

    const { getByText, getByRole } = render(<ZerotierStatus />)

    await waitFor(() => expect(getByText('Authentication is invalid or missing')).toBeTruthy())
    expect(getByRole('button', { name: 'Troubleshooting' })).toBeTruthy()
  })
})
