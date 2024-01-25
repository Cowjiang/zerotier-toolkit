import { invoke, InvokeArgs } from '@tauri-apps/api/tauri'
import { InvokeResponse } from '../typings/types.ts'

export const invokeCommand = async (cmd: string, args?: InvokeArgs): Promise<InvokeResponse & { success: boolean }> => {
  const result: string = await invoke(cmd, args)
  console.log('[Invoke]', cmd, result)
  try {
    const res = JSON.parse(result)
    return {...res, success: res.code === 0}
  } catch (e) {
    console.error(e)
    return {code: -1, data: result, message: result, success: false}
  }
}
