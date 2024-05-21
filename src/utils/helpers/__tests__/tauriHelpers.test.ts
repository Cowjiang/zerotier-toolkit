import { mockIPC } from '@tauri-apps/api/mocks'

import { copyToClipboard, invokeCommand, readTextFile, writeTextFile } from '../tauriHelpers.ts'

const copyTest = vi.fn()
const writeFile = vi.fn()

beforeEach(() => {
  mockIPC((cmd, args) => {
    console.log(args)
    if (cmd === 'invokeCommandTest') {
      return JSON.stringify({ code: 0, data: args.data })
    } else if (cmd === 'invokeCommandFailureTest') {
      return 'invoke command failed'
    } else if (cmd === 'tauri') {
      const cmdMap: { [key: string]: any } = {
        resolvePath: '\\debug\\resources\\configuration.json',
        readTextFile: 'content test',
        writeFile: () => writeFile(),
        writeText: () => copyTest((args.message as any).data),
      }
      !Object.keys(cmdMap).includes((args.message as any)?.cmd) && console.log(args)
      const action = cmdMap?.[(args.message as any)?.cmd]
      typeof action === 'function' && action?.()
      return action
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
    expect(writeFile).toBeCalled()
  })

  it('should copy text to clipboard', async () => {
    const writeTest = async () => await copyToClipboard('write test')
    expect(writeTest).not.toThrowError()
    expect(copyTest).toBeCalledWith('write test')
  })
})
