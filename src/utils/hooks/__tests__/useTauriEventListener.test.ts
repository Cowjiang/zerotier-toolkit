import { mockIPC } from '@tauri-apps/api/mocks'
import { invoke } from '@tauri-apps/api/tauri'
import { renderHook } from '@testing-library/react'
import { expect, vi } from 'vitest'

import useTauriEventListener from '../useTauriEventListener.ts'

let listenCallback: (payload: any) => void

beforeEach(() => {
  const payload = { test: 'test' }

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
