import { fireEvent, waitFor } from '@testing-library/react'

import { mockPeers } from '../../../../__mocks__/zerotier.ts'
import { render } from '../../../../utils/testUtils/setupTest.tsx'
import ZerotierPeers from '../ZerotierPeers.tsx'

const initialPeers = structuredClone(mockPeers)

describe('ZerotierPeers', () => {
  afterEach(() => {
    mockPeers.splice(0, mockPeers.length, ...structuredClone(initialPeers))
  })

  it('should render the connected peers', async () => {
    const { getAllByRole, getAllByText, getByText, queryByText } = render(<ZerotierPeers />)

    await waitFor(() => expect(getByText('25a4a6b1ba')).toBeTruthy())
    expect(getByText('PLANET')).toBeTruthy()
    expect(getByText('MOON')).toBeTruthy()
    expect(getAllByText('LEAF').length).toBe(2)
    expect(getByText('103.195.103.66/9993')).toBeTruthy()
    expect(getByText('120.239.74.49/52769')).toBeTruthy()
    expect(getByText('No path')).toBeTruthy()
    expect(queryByText('-1.-1.-1')).toBeNull()

    const addresses = getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelector('td')?.textContent)
    expect(addresses).toEqual(['a3c1f8a2c9', 'b7d2e5f1c3', '62f865ae71', '25a4a6b1ba'])
  })

  it('should keep the peers matching the keyword only', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ZerotierPeers />)
    await waitFor(() => expect(getByText('a3c1f8a2c9')).toBeTruthy())

    fireEvent.change(getByPlaceholderText('Search peers...'), { target: { value: '103.195' } })

    expect(getByText('25a4a6b1ba')).toBeTruthy()
    expect(queryByText('a3c1f8a2c9')).toBeNull()
    expect(getByText('1/4')).toBeTruthy()
  })
})
