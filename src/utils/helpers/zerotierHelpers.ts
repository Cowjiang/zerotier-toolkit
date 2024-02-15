import { Body, HttpVerb } from '@tauri-apps/api/http'

import { ZEROTIER_SERVICE_HOST } from '../../constant.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { httpRequest } from './tauriHelpers.ts'

type RequestOptions = {
  path: string
  method: HttpVerb
  query?: Record<string, any>
  body?: Body
}

const request = async <T>({ path, method, ...options }: RequestOptions) => {
  const { port, secret } = useZeroTierStore.getState().serverInfo
  if (!port || !secret) {
    throw new Error('Invalid port or secret for the ZeroTier service')
  }
  const httpOptions = {
    url: `${ZEROTIER_SERVICE_HOST}:${port}${path}`,
    method,
    headers: {
      'X-ZT1-Auth': secret,
    },
    ...options,
  }
  const res = await httpRequest<T>(httpOptions)
  console.log('[Request]', httpOptions.url, res)
  !res.ok && (await Promise.reject(res))
  return res
}

export const zerotierService = {
  get: async <T>(path: string) => await request<T>({ method: 'GET', path }),

  delete: async <T>(path: string) => await request<T>({ method: 'DELETE', path }),

  post: async <P, R>(path: string, body?: P) =>
    await request<R>({
      method: 'POST',
      path,
      body: Body.json({ ...body }),
    }),
}
