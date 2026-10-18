import { fireEvent, waitFor } from '@testing-library/react'

import { render } from '../../../../utils/testUtils/setupTest.tsx'
import { mockConfigIPC } from '../../../../utils/testUtils/tauriMocks.ts'
import ZerotierNetworks from '../ZerotierNetworks.tsx'

beforeEach(() => {
  mockConfigIPC()
})

describe('ZerotierNetworks', () => {
  it('should list the networks joined by this node', async () => {
    const { getByText } = render(<ZerotierNetworks />)

    await waitFor(() => expect(getByText('882d314dd3dbd4dd')).toBeTruthy())
    expect(getByText('Cowjiang Private')).toBeTruthy()
    expect(getByText('Home Lab')).toBeTruthy()
    expect(getByText('Connected')).toBeTruthy()
    expect(getByText('Requesting')).toBeTruthy()
  })

  it('should keep the networks matching the keyword only', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ZerotierNetworks />)
    await waitFor(() => expect(getByText('Cowjiang Private')).toBeTruthy())

    fireEvent.change(getByPlaceholderText('Search by Network ID...'), { target: { value: 'Home' } })

    expect(getByText('Home Lab')).toBeTruthy()
    expect(queryByText('Cowjiang Private')).toBeNull()
  })

  it('should open the join dialog of the toolbar', async () => {
    const { getByText } = render(<ZerotierNetworks />)

    fireEvent.click(getByText('Join New'))

    await waitFor(() => expect(getByText('Join New Network')).toBeTruthy())
    expect(getByText('Enter 16-digit Network ID')).toBeTruthy()
  })
})
