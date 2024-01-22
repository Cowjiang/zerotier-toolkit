import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';
import { InvokeResponse } from '../typings/types.ts';

export const invokeCommand = async (cmd: string, args?: InvokeArgs): Promise<InvokeResponse> => {
  const result: string = await invoke(cmd, args)
  console.log('[Invoke]', cmd, result)
  try {
    return JSON.parse(result)
  } catch (e) {
    console.error(e)
    return {code: -1, data: result, message: result}
  }
}
