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
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { openUrl as openUrlInTauri } from '@tauri-apps/plugin-opener'
import { check } from '@tauri-apps/plugin-updater'

import { CONFIGURATION_FILE_PATH } from '../../constant.ts'
import { InvokeEvent } from '../../typings/enum.ts'
import { InvokeResponse } from '../../typings/global.ts'

export const fetch: typeof tauriFetch = async (url, options) => {
  try {
    return await tauriFetch(url, options)
  } catch (e) {
    console.error('[Fetch]', url, e)
    throw e
  }
}

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

export const openUrl = async (url: string) => {
  url && (await openUrlInTauri(url))
}

export const forwardConsole = async (fn: 'log' | 'debug' | 'info' | 'warn' | 'error') => {
  const original = console[fn]
  try {
    const logger = (await import('@tauri-apps/plugin-log'))[fn === 'log' ? 'info' : fn]
    console[fn] = (...args) => {
      original(...args)
      logger(args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '))
    }
  } catch (e) {
    console.error('[ForwardConsole]', e)
  }
}

export const checkUpdate: typeof check = async (options) => {
  const update = await check(options)
  if (!update) {
    return null
  }
  console.log('[Check Update]', update)
  return update
}
