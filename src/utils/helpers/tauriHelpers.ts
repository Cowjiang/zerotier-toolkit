import { getVersion } from '@tauri-apps/api/app'
import { invoke, InvokeArgs } from '@tauri-apps/api/core'
import { resolveResource } from '@tauri-apps/api/path'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import {
  ReadFileOptions,
  readTextFile as tauriReadTextFile,
  WriteFileOptions,
  writeTextFile as tauriWriteTextFile,
} from '@tauri-apps/plugin-fs'
// 别名
import { openUrl as openUrlInTauri } from '@tauri-apps/plugin-opener'

import { CONFIGURATION_FILE_PATH } from '../../constant.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { InvokeResponse } from '../../typings/global.ts'

export const invokeCommand = async (cmd: string, args?: InvokeArgs): Promise<InvokeResponse & { success: boolean }> => {
  const result: string = await invoke(cmd, args)
  console.log('[Invoke]', cmd, result)
  try {
    const res = JSON.parse(result)
    return { ...res, success: res.code === 0 }
  } catch (e) {
    return { code: -1, data: result, message: result, success: false }
  }
}

export const readTextFile = async (path = CONFIGURATION_FILE_PATH, options?: ReadFileOptions) => {
  const filePath = await resolveResource(path)
  const content = await tauriReadTextFile(filePath, options)
  console.log('[ReadTextFile]', filePath, content, options)
  return content
}

export const writeTextFile = async (contents: string, path = CONFIGURATION_FILE_PATH, options?: WriteFileOptions) => {
  const filePath = await resolveResource(path)
  const response = await tauriWriteTextFile(filePath, contents, options)
  console.log('[WriteTextFile]', filePath, contents, options)
  return response
}

export const copyToClipboard = async (text: string) => {
  await writeText(text)
}

export const minimizeWindow = async () => {
  await getCurrentWindow().minimize()
}

export const closeWindow = async () => {
  await invokeCommand(InvokeEvent.CLOSE_MAIN_WINDOW)
}

export const showWindow = async () => {
  const appWindow = getCurrentWindow()
  ;(await appWindow.isMinimized()) && (await appWindow.unminimize())
  await appWindow.show()
}

export const getAppVersion = async () => {
  return await getVersion()
}

export const openInSystem = async (argument: string) => {
  argument && (await invokeCommand(InvokeEvent.OPEN_IN_OPERATION_SYSTEM, { something: argument }))
}

export const openUrl = async (url: string) => {
  url && (await openUrlInTauri(url))
}
