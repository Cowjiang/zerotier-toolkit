import { FsOptions, readTextFile as tauriReadTextFile, writeTextFile as tauriWriteTextFile } from '@tauri-apps/api/fs'
import { getClient, HttpOptions } from '@tauri-apps/api/http'
import { resolveResource } from '@tauri-apps/api/path'
import { invoke, InvokeArgs } from '@tauri-apps/api/tauri'

import { CONFIGURATION_FILE_PATH } from '../../constant.ts'
import { InvokeResponse } from '../../typings/global.ts'

export const invokeCommand = async (cmd: string, args?: InvokeArgs): Promise<InvokeResponse & { success: boolean }> => {
  const result: string = await invoke(cmd, args)
  console.log('[Invoke]', cmd, result)
  try {
    const res = JSON.parse(result)
    return { ...res, success: res.code === 0 }
  } catch (e) {
    console.error(e)
    return { code: -1, data: result, message: result, success: false }
  }
}

export const httpRequest = async <T>(options: HttpOptions) => {
  const client = await getClient()
  return await client.request<T>(options)
}

export const readTextFile = async (path = CONFIGURATION_FILE_PATH, options?: FsOptions) => {
  const filePath = await resolveResource(path)
  const content = await tauriReadTextFile(filePath, options)
  console.log('[ReadTextFile]', filePath, content, options)
  return content
}

export const writeTextFile = async (contents: string, path = CONFIGURATION_FILE_PATH, options?: FsOptions) => {
  const filePath = await resolveResource(path)
  const response = await tauriWriteTextFile(filePath, contents, options)
  console.log('[WriteTextFile]', filePath, contents, options)
  return response
}
