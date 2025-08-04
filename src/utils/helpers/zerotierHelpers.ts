import { fetch } from '@tauri-apps/plugin-http'

import { ZEROTIER_SERVICE_HOST } from '../../constant.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { ZerotierConfig } from '../../typings/config.ts'

type RequestOptions = {
  path: string
  method: string
  query?: Record<string, any>
  body?: BodyInit
}
type HttpResponse<T> = {
  ok: boolean
  status: number
  data: T
}

const request = async <T>({ path, method, ...options }: RequestOptions): Promise<HttpResponse<T>> => {
  const { serverInfo, config } = useZeroTierStore.getState()
  const { port, secret } = serverInfo
  const { [ZerotierConfig.PORT]: overridePort, [ZerotierConfig.TOKEN]: overrideToken } = config
  if ((!overridePort || !overrideToken) && (!port || !secret)) {
    // throw new Error('Invalid port or secret for the ZeroTier service')
    throw {
      ok: false,
      status: 401,
      data: 'Invalid port or secret for the ZeroTier service',
    } as HttpResponse<T>
  }
  const httpOptions = {
    method,
    headers: {
      'X-ZT1-Auth': overrideToken || secret || '',
    },
    ...options,
  } as RequestInit
  const url = `${ZEROTIER_SERVICE_HOST}:${overridePort || port}${path}`
  const res = await fetch(url, httpOptions)
  console.log('[Request]', path, httpOptions, res)
  !res.ok && (await Promise.reject(res))
  return {
    ok: res.ok,
    status: res.status,
    data: JSON.parse(await res.text()) as T,
  }
}

export const zerotierService = {
  get: async <T>(path: string) => await request<T>({ method: 'GET', path }),

  delete: async <T>(path: string) => await request<T>({ method: 'DELETE', path }),

  post: async <P, R>(path: string, body?: P) =>
    await request<R>({
      method: 'POST',
      path,
      body: JSON.stringify(body),
    }),
}
