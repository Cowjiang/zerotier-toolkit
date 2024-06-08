import { mockIPC } from '@tauri-apps/api/mocks'
import { expect } from 'vitest'

import { copyToClipboard, invokeCommand, readTextFile, showWindow, writeTextFile } from '../tauriHelpers.ts'

const copyTextMock = vi.fn()
const writeFileMock = vi.fn()
const unminimizeMock = vi.fn()
const showWindowMock = vi.fn()

beforeEach(() => {
  mockIPC(async (cmd, args) => {
    if (cmd === 'invokeCommandTest') {
      return JSON.stringify({ code: 0, data: args.data })
    } else if (cmd === 'invokeCommandFailureTest') {
      return 'invoke command failed'
    } else if (cmd === 'tauri') {
      const cmdMap: { [key: string]: any } = {
        resolvePath: '\\debug\\resources\\configuration.json',
        readTextFile: 'content test',
        writeFile: () => writeFileMock(),
        writeText: () => copyTextMock((args.message as any).data),
        manage: () => {
          const { cmd } = (args.message as any).data
          if (cmd?.type === 'isMinimized') {
            return true
          } else if (cmd?.type === 'unminimize') {
            unminimizeMock()
          } else if (cmd?.type === 'show') {
            showWindowMock()
          }
        },
      }
      !Object.keys(cmdMap).includes((args.message as any)?.cmd) && console.log(args)
      const action = cmdMap?.[(args.message as any)?.cmd]
      return typeof action !== 'function' ? action : action?.()
    }
  })
})

describe('Tauri helpers', () => {
  describe('invoke command', () => {
    it('should invoke command', async () => {
      const { success, data } = await invokeCommand('invokeCommandTest', {
        data: 'success',
      })
      expect(success).toBeTruthy()
      expect(data).toBe('success')
    })

    it('should return error code if response is invalid', async () => {
      const { code, success, data } = await invokeCommand('invokeCommandFailureTest')
      expect(code).toBe(-1)
      expect(success).toBeFalsy()
      expect(data).toBe('invoke command failed')
    })
  })

  it('should read text file', async () => {
    const content = await readTextFile()
    expect(content).toBe('content test')
  })

  it('should write text file', async () => {
    await writeTextFile('write test')
    expect(writeFileMock).toBeCalled()
  })

  it('should copy text to clipboard', async () => {
    const writeTest = async () => await copyToClipboard('write test')
    expect(writeTest).not.toThrowError()
    expect(copyTextMock).toBeCalledWith('write test')
  })

  it('should unminimize and show window', async () => {
    await showWindow()
    expect(unminimizeMock).toBeCalled()
    expect(showWindowMock).toBeCalled()
  })
})
