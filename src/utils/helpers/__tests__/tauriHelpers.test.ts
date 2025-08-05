import { mockIPC } from '@tauri-apps/api/mocks'

import { copyToClipboard, invokeCommand, readTextFile, showWindow, writeTextFile } from '../tauriHelpers.ts'

const copyTextMock = vi.fn()
const writeFileMock = vi.fn()
const unminimizeMock = vi.fn()
const showWindowMock = vi.fn()

beforeEach(() => {
  mockIPC(async (cmd, args) => {
    const cmdMap: { [key: string]: () => void } = {
      invokeCommandTest: () => JSON.stringify({ code: 0, data: (args as any).data }),
      invokeCommandFailureTest: () => 'invoke command failed',
      'plugin:path|resolve_directory': () => '\\debug\\resources\\configuration.json',
      'plugin:fs|read_text_file': () => 'test',
      'plugin:fs|write_text_file': () => writeFileMock(),
      'plugin:clipboard-manager|write_text': () => copyTextMock((args as any).text),
      'plugin:window|is_minimized': () => true,
      'plugin:window|unminimize': () => unminimizeMock(),
      'plugin:window|show': () => showWindowMock(),
    }
    const action = cmdMap?.[cmd]
    if (typeof action !== 'function') {
      console.warn('[Warning] Command not mocked', cmd)
      return
    }
    return action?.()
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
    expect(content.length).toBe(4)
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
