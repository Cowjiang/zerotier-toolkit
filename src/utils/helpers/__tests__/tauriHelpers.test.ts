import { mockIPC } from '@tauri-apps/api/mocks'
import { beforeEach, expect } from 'vitest'

import { invokeCommand, readTextFile, writeTextFile } from '../tauriHelpers.ts'

beforeEach(() => {
  mockIPC((cmd, args) => {
    if (cmd === 'invokeCommandTest') {
      return JSON.stringify({ code: 0, data: args.data })
    } else if (cmd === 'tauri') {
      const cmdMap: { [key: string]: any } = {
        resolvePath: '\\debug\\resources\\configuration.json',
        readTextFile: 'content test',
        writeFile: undefined,
      }
      !Object.keys(cmdMap).includes((args.message as any)?.cmd) && console.log(args)
      return cmdMap?.[(args.message as any)?.cmd]
    }
  })
})

describe('Tauri helpers', () => {
  it('should invoke command', async () => {
    const { success, data } = await invokeCommand('invokeCommandTest', {
      data: 'success',
    })
    expect(success).toBeTruthy()
    expect(data).toBe('success')
  })

  it('should read text file', async () => {
    const content = await readTextFile()
    expect(content).toBe('content test')
  })

  it('should write text file', async () => {
    const writeTest = async () => await writeTextFile('write test')
    expect(writeTest).not.toThrowError()
  })
})
