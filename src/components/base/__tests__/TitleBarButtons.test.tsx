import { mockIPC } from '@tauri-apps/api/mocks'
import { fireEvent } from '@testing-library/react'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import TitleBarButtons from '../TitleBarButtons.tsx'

const minimizeWindow = vi.fn()
const closeWindow = vi.fn()
beforeEach(() => {
  mockIPC((command) => {
    if (command === 'close_main_window') {
      closeWindow()
    } else if (command === 'plugin:window|minimize') {
      minimizeWindow()
    }
  })
})

describe('TitleBarButtons', () => {
  it('should minimize the window', async () => {
    const { getByLabelText } = render(<TitleBarButtons />)
    fireEvent.click(getByLabelText('Minimize window'))
    expect(minimizeWindow).toBeCalled()
  })

  it('should close the window', async () => {
    const { getByLabelText } = render(<TitleBarButtons />)
    fireEvent.click(getByLabelText('Close window'))
    expect(closeWindow).toBeCalled()
  })
})
