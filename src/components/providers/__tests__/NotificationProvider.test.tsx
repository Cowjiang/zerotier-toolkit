import { fireEvent, renderHook as renderHookBare, waitFor } from '@testing-library/react'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import { useNotification } from '../NotificationProvider.tsx'

function NotificationButtons() {
  const { setNotification, closeNotification } = useNotification()
  return (
    <div>
      <button onClick={() => setNotification({ children: 'Saved', duration: 300 })}>notify</button>
      <button onClick={() => setNotification({ children: 'Second message' })}>notify again</button>
      <button onClick={closeNotification}>close</button>
    </div>
  )
}

describe('NotificationProvider', () => {
  it('should show the notification and close it by itself', async () => {
    const { getByText, queryByText } = render(<NotificationButtons />)

    fireEvent.click(getByText('notify'))
    expect(getByText('Saved')).toBeTruthy()

    await waitFor(() => expect(queryByText('Saved')).toBeNull(), { timeout: 2000 })
  })

  it('should close the notification when the user clicks the close icon', async () => {
    const { getByText, queryByText, container } = render(<NotificationButtons />)

    fireEvent.click(getByText('notify again'))
    expect(getByText('Second message')).toBeTruthy()

    const closeIcon = container.querySelector('svg[role="icon"]') as SVGElement
    fireEvent.click(closeIcon)

    await waitFor(() => expect(queryByText('Second message')).toBeNull(), { timeout: 2000 })
  })

  it('should fail outside of the provider', () => {
    expect(() => renderHookBare(() => useNotification())).toThrow(
      'useNotification must be used within a NotificationProvider',
    )
  })
})
