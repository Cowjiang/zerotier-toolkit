import { Network } from '../typings/zerotier.ts'
import { request } from '../utils/zerotierHelpers.ts'

export const zerotierService = {
  getNetworks: async () => {
    try {
      const response = await request<Network[]>({
        path: '/network',
        method: 'GET',
      })
      if (!response.ok) {
        console.error('get network fail:', response)
        return []
      }
      return response.data
    } catch (e) {
      console.error(e)
      return []
    }
  },
}
