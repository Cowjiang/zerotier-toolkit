import { ZEROTIER_SERVICE_HOST } from '../../constant.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { ZerotierConfig } from '../../typings/config.ts'
import { HttpResponse } from '../../typings/global.ts'
import { fetch } from './tauriHelpers.ts'

type RequestOptions = {
  path: string
  method: string
  query?: Record<string, any>
  body?: BodyInit
}

const request = async <T>({ path, method, ...options }: RequestOptions): Promise<HttpResponse<T>> => {
  const { serverInfo, config } = useZeroTierStore.getState()
  const { port, secret } = serverInfo
  const { [ZerotierConfig.PORT]: overridePort, [ZerotierConfig.TOKEN]: overrideToken } = config
  if ((!overridePort || !overrideToken) && (!port || !secret)) {
    throw {
      ok: false,
      status: 401,
      data: 'Invalid port or secret for the ZeroTier service',
    } satisfies HttpResponse<string>
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
    data: (await res.json()) satisfies T,
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
