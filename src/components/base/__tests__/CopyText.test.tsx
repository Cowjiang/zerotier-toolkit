import { mockIPC } from '@tauri-apps/api/mocks'
import { fireEvent } from '@testing-library/react'
import { expect, vi } from 'vitest'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import CopyText from '../CopyText.tsx'

const writeText = vi.fn()
beforeEach(() => {
  mockIPC((cmd, args) => {
    if (cmd === 'tauri' && (args.message as any)?.cmd === 'writeText') {
      writeText((args.message as any)?.data)
    }
  })
})

describe('CopyTest', () => {
  it('should copy the provided value when clicking', async () => {
    const copyValue = 'test'
    const { getByText } = render(<CopyText copyValue={copyValue}>content</CopyText>)
    fireEvent.click(getByText('content'))
    expect(writeText).toBeCalledWith(copyValue)
  })

  it('should not copy if value not provided', async () => {
    const { getByText } = render(<CopyText>content</CopyText>)
    fireEvent.click(getByText('content'))
    expect(writeText).not.toBeCalled()
  })
})
