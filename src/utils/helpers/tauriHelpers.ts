import { getVersion } from '@tauri-apps/api/app'
import { writeText } from '@tauri-apps/api/clipboard'
import { FsOptions, readTextFile as tauriReadTextFile, writeTextFile as tauriWriteTextFile } from '@tauri-apps/api/fs'
import { getClient, HttpOptions } from '@tauri-apps/api/http'
import { resolveResource } from '@tauri-apps/api/path'
import { invoke, InvokeArgs } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'

import { CONFIGURATION_FILE_PATH } from '../../constant.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { InvokeResponse } from '../../typings/global.ts'

export default class TauriHelpers {
  constructor() {
    if (!window?.__TAURI__) {
      throw new Error('Tauri environment not found')
    }
  }

  invokeCommand = async (cmd: string, args?: InvokeArgs): Promise<InvokeResponse & { success: boolean }> => {
    const result: string = await invoke(cmd, args)
    console.log('[Invoke]', cmd, result)
    try {
      const res = JSON.parse(result)
      return { ...res, success: res.code === 0 }
    } catch (e) {
      return { code: -1, data: result, message: result, success: false }
    }
  }

  httpRequest = async <T>(options: HttpOptions) => {
    const client = await getClient()
    return await client.request<T>(options)
  }

  readTextFile = async (path = CONFIGURATION_FILE_PATH, options?: FsOptions) => {
    const filePath = await resolveResource(path)
    const content = await tauriReadTextFile(filePath, options)
    console.log('[ReadTextFile]', filePath, content, options)
    return content
  }

  writeTextFile = async (contents: string, path = CONFIGURATION_FILE_PATH, options?: FsOptions) => {
    const filePath = await resolveResource(path)
    const response = await tauriWriteTextFile(filePath, contents, options)
    console.log('[WriteTextFile]', filePath, contents, options)
    return response
  }

  copyToClipboard = async (text: string) => {
    await writeText(text)
  }

  minimizeWindow = async () => {
    await appWindow.minimize()
  }

  closeWindow = async () => {
    await this.invokeCommand(InvokeEvent.CLOSE_MAIN_WINDOW)
  }

  showWindow = async () => {
    ;(await appWindow.isMinimized()) && (await appWindow.unminimize())
    await appWindow.show()
  }

  getAppVersion = async () => {
    return await getVersion()
  }

  openInSystem = async (argument: string) => {
    argument && (await this.invokeCommand(InvokeEvent.OPEN_SOMETHING, { something: argument }))
  }
}
