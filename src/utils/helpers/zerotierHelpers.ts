import { Body, HttpVerb, Response } from '@tauri-apps/api/http'

import { ZEROTIER_SERVICE_HOST } from '../../constant.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { ZerotierConfig } from '../../typings/config.ts'
import { httpRequest } from './tauriHelpers.ts'

type RequestOptions = {
  path: string
  method: HttpVerb
  query?: Record<string, any>
  body?: Body
}

const request = async <T>({ path, method, ...options }: RequestOptions) => {
  const { serverInfo, config } = useZeroTierStore.getState()
  const { port, secret } = serverInfo
  const { [ZerotierConfig.PORT]: overridePort, [ZerotierConfig.TOKEN]: overrideToken } = config
  if ((!overridePort || !overrideToken) && (!port || !secret)) {
    // throw new Error('Invalid port or secret for the ZeroTier service')
    throw {
      ok: false,
      status: 401,
      data: 'Invalid port or secret for the ZeroTier service',
    } as Response<T>
  }
  const httpOptions = {
    url: `${ZEROTIER_SERVICE_HOST}:${overridePort || port}${path}`,
    method,
    headers: {
      'X-ZT1-Auth': overrideToken || secret,
    },
    ...options,
  }
  const res: Response<T> = await httpRequest<T>(httpOptions)
  console.log('[Request]', httpOptions, res)
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
