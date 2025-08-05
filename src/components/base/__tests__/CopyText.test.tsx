import { mockIPC } from '@tauri-apps/api/mocks'
import { fireEvent } from '@testing-library/react'
import { expect, vi } from 'vitest'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import CopyText from '../CopyText.tsx'

const copyTextMock = vi.fn()
beforeEach(() => {
  mockIPC((cmd, args) => {
    const cmdMap: { [key: string]: () => void } = {
      'plugin:clipboard-manager|write_text': () => copyTextMock((args as any).text),
    }
    const action = cmdMap?.[cmd]
    if (typeof action !== 'function') {
      console.warn('[Warning] Command not mocked', cmd)
      return
    }
    return action?.()
  })
})

describe('CopyTest', () => {
  it('should copy the provided value when clicking', async () => {
    const copyValue = 'test'
    const { getByText } = render(<CopyText copyValue={copyValue}>content</CopyText>)
    fireEvent.click(getByText('content'))
    expect(copyTextMock).toBeCalledWith(copyValue)
  })

  it('should not copy if value not provided', async () => {
    const { getByText } = render(<CopyText>content</CopyText>)
    fireEvent.click(getByText('content'))
    expect(copyTextMock).not.toBeCalled()
  })
})
