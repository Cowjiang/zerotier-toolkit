import { Body, HttpVerb } from '@tauri-apps/api/http'
import { ZEROTIER_SERVICE_HOST } from '../../constant.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { httpRequest } from './tauriHelpers.ts'

type RequestOptions = {
  path: string,
  method: HttpVerb
  query?: Record<string, any>
  body?: Body
}

const request = async ({path, method, ...options}: RequestOptions) => {
  const {port, secret} = useZeroTierStore.getState().serverInfo
  if (!port || !secret) {
    throw new Error('Invalid port or secret for the ZeroTier service')
  }
  const httpOptions = {
    url: `${ZEROTIER_SERVICE_HOST}:${port}${path}`,
    method,
    headers: {
      'X-ZT1-Auth': secret
    },
    ...options
  }
  return await httpRequest(httpOptions)
}

export const zerotierService = {
  get: async (path: string) => await request({method: 'GET', path})
}
