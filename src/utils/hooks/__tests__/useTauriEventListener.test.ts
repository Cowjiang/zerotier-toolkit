import { invoke } from '@tauri-apps/api/core'
import { mockIPC } from '@tauri-apps/api/mocks'
import { renderHook } from '@testing-library/react'

import useTauriEventListener from '../useTauriEventListener.ts'

let listenCallback: (payload: any) => void

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: (event: string, callback: (payload: any) => void) => {
    if (event === 'myEvent') {
      listenCallback = callback
    }
  },
}))

beforeEach(() => {
  const payload = { test: 'test' }

  mockIPC((cmd) => {
    if (cmd === 'myEvent') {
      return listenCallback ? listenCallback(payload) : null
    }
  })
})

describe('useTauriEventListener', () => {
  it('should call the event listener', () => {
    const handler = vi.fn()
    renderHook(() => useTauriEventListener('myEvent', handler))

    invoke('myEvent')
    expect(handler).toHaveBeenCalled()
  })
})
