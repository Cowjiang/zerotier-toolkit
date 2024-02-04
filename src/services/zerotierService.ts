import { Network, Status } from '../typings/zerotier.ts'
import { zerotierService } from '../utils/zerotierHelpers.ts'

const getNetworks = () => zerotierService.get<Network[]>('/network')

const getStatus = () => zerotierService.get<Status>('/status')

export {
  getNetworks,
  getStatus
}
