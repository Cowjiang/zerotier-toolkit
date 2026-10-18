import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { Network, Peer, Status } from '../typings/zerotier.ts'

const now = Date.now()

// the payloads below mirror what the local ZeroTier service returns on Windows
export const mockStatus: Status = {
  address: '7c086786bb',
  clock: now,
  config: {
    settings: {
      allowTcpFallbackRelay: true,
      forceTcpRelay: false,
      listeningOn: ['192.168.0.3/9993'],
      portMappingEnabled: true,
      primaryPort: 9993,
      secondaryPort: 34151,
      softwareUpdate: 'apply',
      softwareUpdateChannel: 'release',
      surfaceAddresses: ['121.32.50.196/23882'],
      tertiaryPort: 59923,
    },
  },
  online: true,
  planetWorldId: 149604618,
  planetWorldTimestamp: 1567191349589,
  publicIdentity:
    '7c086786bb:0:024db3132e0c08241673a052a3d87edb165ebf1b2f1944d1e747071833ad61393780173b272ec7d851e1ec659f5',
  tcpFallbackActive: false,
  version: '1.14.2',
  versionBuild: 0,
  versionMajor: 1,
  versionMinor: 14,
  versionRev: 2,
}

export const mockNetworks: Network[] = [
  {
    id: '882d314dd3dbd4dd',
    name: 'Cowjiang Private',
    status: 'OK',
    type: 'PRIVATE',
    mac: 'ae:5f:52:c4:19:6b',
    mtu: 2800,
    netconfRevision: 42,
    assignedAddresses: ['172.24.0.1/24'],
    portDeviceName: 'ethernet_32772',
    portError: 0,
    allowManaged: true,
    allowGlobal: false,
    allowDefault: false,
    allowDNS: false,
    bridge: false,
    broadcastEnabled: false,
    dns: { domain: '', servers: [] },
    routes: [{ target: '172.24.0.0/24', via: null }],
  },
  {
    id: '8056c2e21c000001',
    name: 'Home Lab',
    status: 'REQUESTING_CONFIGURATION',
    type: 'PRIVATE',
    mac: '62:1f:9a:70:33:8d',
    mtu: 2800,
    netconfRevision: 1,
    assignedAddresses: [],
    portDeviceName: 'ethernet_32772',
    portError: 0,
    allowManaged: true,
    allowGlobal: false,
    allowDefault: false,
    allowDNS: false,
    bridge: false,
    broadcastEnabled: false,
    dns: { domain: '', servers: [] },
    routes: [],
  },
]

export const mockPeers: Peer[] = [
  {
    address: '25a4a6b1ba',
    role: 'PLANET',
    latency: -558,
    isBonded: false,
    tunneled: false,
    version: '-1.-1.-1',
    versionMajor: -1,
    versionMinor: -1,
    versionRev: -1,
    paths: [
      {
        address: '103.195.103.66/9993',
        active: true,
        preferred: true,
        expired: false,
        trustedPathId: 0,
        lastReceive: now - 5000,
        lastSend: now - 3000,
      },
    ],
  },
  {
    address: '62f865ae71',
    role: 'MOON',
    latency: -1,
    isBonded: false,
    tunneled: false,
    version: '-1.-1.-1',
    versionMajor: -1,
    versionMinor: -1,
    versionRev: -1,
    paths: [],
  },
  {
    address: 'a3c1f8a2c9',
    role: 'LEAF',
    latency: -1,
    isBonded: false,
    tunneled: true,
    version: '1.12.2',
    versionMajor: 1,
    versionMinor: 12,
    versionRev: 2,
    paths: [
      { address: '192.168.0.3/9993', active: false, preferred: false, expired: true, lastReceive: now - 86400000 },
      {
        address: '120.239.74.49/52769',
        active: true,
        preferred: true,
        expired: false,
        trustedPathId: 0,
        lastReceive: now - 30000,
        lastSend: now - 4000,
      },
    ],
  },
  {
    address: 'b7d2e5f1c3',
    role: 'LEAF',
    latency: -676,
    isBonded: false,
    tunneled: false,
    version: '1.14.2',
    versionMajor: 1,
    versionMinor: 14,
    versionRev: 2,
    paths: [
      {
        address: '2408:8456:8a00:1b2c:9d1f:6e77:4b3a:91fe/52769',
        active: true,
        preferred: true,
        expired: false,
        trustedPathId: 0,
        lastReceive: now - 900,
        lastSend: now - 600,
      },
    ],
  },
]

const notFound = () => HttpResponse.json({ error: 'not found' }, { status: 404 })

const httpHandlers = [
  http.get('*/test', () => HttpResponse.json({})),
  http.get('*/status', () => HttpResponse.json(mockStatus)),
  http.get('*/network', () => HttpResponse.json(mockNetworks)),
  http.get('*/network/:networkId', ({ params }) => {
    const network = mockNetworks.find(({ id }) => id === params.networkId)
    return network ? HttpResponse.json(network) : notFound()
  }),
  http.post('*/network/:networkId', async ({ params, request }) => {
    const details = (await request.text()) || '{}'
    return HttpResponse.json({
      ...mockNetworks.find(({ id }) => id === params.networkId),
      id: params.networkId,
      status: 'REQUESTING_CONFIGURATION',
      ...JSON.parse(details),
    })
  }),
  http.delete('*/network/:networkId', () => HttpResponse.json({ result: true })),
  http.get('*/peer', () => HttpResponse.json(mockPeers)),
  http.get('*/peer/:address', ({ params }) => {
    const peer = mockPeers.find(({ address }) => address === params.address)
    return peer ? HttpResponse.json(peer) : notFound()
  }),
]

export const mockServer = setupServer(...httpHandlers)
