import { fireEvent, render } from '@testing-library/react'

import RefreshButton from '../RefreshButton'

describe('RefreshButton', () => {
  it('should call onRefresh when the button is clicked', async () => {
    const onRefreshMock = vi.fn()
    const { getByRole } = render(<RefreshButton onRefresh={onRefreshMock} />)
    fireEvent.click(getByRole('button'))
    expect(onRefreshMock).toHaveBeenCalled()
  })

  it('should not call onRefresh when the it is loading', async () => {
    const onRefreshMock = vi.fn()
    const { getByRole } = render(<RefreshButton onRefresh={onRefreshMock} isLoading={true} />)
    fireEvent.click(getByRole('button'))
    expect(onRefreshMock).not.toHaveBeenCalled()
  })
})
