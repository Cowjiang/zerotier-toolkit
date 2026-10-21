import { mockPeers } from '../../__mocks__/zerotier.ts'
import { ZerotierConfig } from '../../typings/config.ts'
import { mockConfigIPC } from '../../utils/testUtils/tauriMocks.ts'
import { useZeroTierStore } from '../zerotier.ts'

const { getState, setState } = useZeroTierStore

beforeEach(() => {
  mockConfigIPC()
})

describe('zerotier store', () => {
  it('should load the networks joined by this node', async () => {
    await getState().getNetworks()

    expect(getState().networks.map(({ id }) => id)).toEqual(['882d314dd3dbd4dd', '8056c2e21c000001'])
  })

  it('should keep the networks gone from the service as disconnected', async () => {
    setState({ config: { [ZerotierConfig.NETWORKS]: [{ id: 'aaaaaaaaaaaaaaaa', name: 'Old network' }] } })

    await getState().getNetworks()

    expect(getState().networks.find(({ id }) => id === 'aaaaaaaaaaaaaaaa')?.status).toBe('DISCONNECTED')
    expect(getState().config[ZerotierConfig.NETWORKS]?.length).toBe(3)
  })

  it('should load the peers of this node', async () => {
    await getState().getPeers()

    expect(getState().peers.length).toBe(mockPeers.length)
  })

  it('should disconnect a network and delete it from the history', async () => {
    await getState().getNetworks()
    const networkId = '882d314dd3dbd4dd'

    await getState().disconnectNetwork(networkId)
    expect(getState().networks.find(({ id }) => id === networkId)?.status).toBe('DISCONNECTED')

    getState().deleteNetwork(networkId)
    expect(getState().networks.find(({ id }) => id === networkId)).toBeUndefined()
  })

  it('should merge the configuration given by the user', () => {
    getState().setConfig({ [ZerotierConfig.TOKEN]: 'local-token' })

    expect(getState().config[ZerotierConfig.TOKEN]).toBe('local-token')
  })
})
