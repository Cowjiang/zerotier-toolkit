import {
  getNetworkById,
  getNetworks,
  getPeerByAddress,
  getPeers,
  joinNetwork,
  leaveNetwork,
} from '../zerotierService.ts'

describe('zerotierService with the mocked service', () => {
  it('should list the networks joined by this node', async () => {
    const { data: networks } = await getNetworks()
    expect(networks.length).toBe(2)
    expect(networks[0]).toMatchObject({
      id: '882d314dd3dbd4dd',
      name: 'Cowjiang Private',
      status: 'OK',
      assignedAddresses: ['172.24.0.1/24'],
      portDeviceName: 'ethernet_32772',
    })
  })

  it('should read a single network', async () => {
    const { data: network } = await getNetworkById('882d314dd3dbd4dd')
    expect(network.routes).toEqual([{ target: '172.24.0.0/24', via: null }])
  })

  it('should read the peers and a single peer', async () => {
    const { data: peers } = await getPeers()
    expect(peers.length).toBe(4)
    expect(peers.filter(({ role }) => role === 'LEAF').length).toBe(2)

    const { data: peer } = await getPeerByAddress('25a4a6b1ba')
    expect(peer).toMatchObject({ role: 'PLANET', version: '-1.-1.-1' })
  })

  it('should join and leave a network', async () => {
    const { data: joined } = await joinNetwork('8056c2e21c000001')
    expect(joined).toMatchObject({ id: '8056c2e21c000001', status: 'REQUESTING_CONFIGURATION' })

    const { status } = await leaveNetwork('8056c2e21c000001')
    expect(status).toBe(200)
  })

  it('should fail on an unknown network or peer', async () => {
    await expect(getNetworkById('0000000000000000')).rejects.toMatchObject({ status: 404 })
    await expect(getPeerByAddress('0000000000')).rejects.toMatchObject({ status: 404 })
  })
})
