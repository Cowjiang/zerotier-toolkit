import { fireEvent, waitFor } from '@testing-library/react'

import { useZeroTierStore } from '../../../../store/zerotier.ts'
import { ZerotierConfig } from '../../../../typings/config.ts'
import { render } from '../../../../utils/testUtils/setupTest.tsx'
import { mockConfigIPC, mockFailingIPC } from '../../../../utils/testUtils/tauriMocks.ts'
import ZerotierExperiments from '../ZerotierExperiments.tsx'

beforeEach(() => {
  mockConfigIPC()
})

describe('ZerotierExperiments', () => {
  it('should show the service information read from this node', () => {
    const { getByText, getByPlaceholderText } = render(<ZerotierExperiments />)

    expect(getByText('Secret Token')).toBeTruthy()
    expect(getByText('Service Port')).toBeTruthy()
    expect(getByPlaceholderText('test')).toBeTruthy()
    expect(getByPlaceholderText('9999')).toBeTruthy()
  })

  it('should store the token and the port typed by the user', () => {
    const { getByPlaceholderText } = render(<ZerotierExperiments />)

    fireEvent.change(getByPlaceholderText('test'), { target: { value: 'local-token' } })
    expect(useZeroTierStore.getState().config[ZerotierConfig.TOKEN]).toBe('local-token')

    fireEvent.change(getByPlaceholderText('9999'), { target: { value: '1600' } })
    expect(useZeroTierStore.getState().config[ZerotierConfig.PORT]).toBe(1600)
  })

  it('should warn when the ZeroTier One directory cannot be opened', async () => {
    mockFailingIPC('failed to open dir')
    const { getByText } = render(<ZerotierExperiments />)

    fireEvent.click(getByText('Open Folder'))

    await waitFor(() => expect(getByText('Failed to open ZeroTier One directory')).toBeTruthy())
  })
})
