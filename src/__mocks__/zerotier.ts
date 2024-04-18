import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const httpHandlers = [
  http.get('*/status', () =>
    HttpResponse.json({
      address: '7c087768bb',
      clock: 1713444994744,
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
      version: '1.12.2',
      versionBuild: 0,
      versionMajor: 1,
      versionMinor: 12,
      versionRev: 2,
    }),
  ),
]

export const mockServer = setupServer(...httpHandlers)
