export type ServerInfo = {
  port?: number
  secret?: string
}

export interface Network {
  /**
   * Let ZeroTier modify the system's default route.
   */
  allowDefault?: boolean
  /**
   * Let ZeroTier modify the system's DNS settings.
   */
  allowDNS?: boolean
  /**
   * Let ZeroTier manage IP addresses and route assignments that aren't in private ranges
   * (rfc1918).
   *
   * Let ZeroTier manage IP addresses and Route assignments that aren't in private ranges
   * (rfc1918).
   */
  allowGlobal?: boolean
  /**
   * Let ZeroTier manage IP addresses and Route assignments.
   *
   * Let ZeroTier to manage IP addresses and Route assignments.
   */
  allowManaged?: boolean
  assignedAddresses?: string[]
  bridge?: boolean
  broadcastEnabled?: boolean
  dns?: Dns
  id?: string
  /**
   * MAC address for this network's interface.
   */
  mac?: string
  mtu?: number
  multicastSubscriptions?: MulticastSubscription[]
  name?: string
  netconfRevision?: number
  portDeviceName?: string
  portError?: number
  routes?: Route[]
  status?: NetworkStatus
  type?: NetworkType
}

export type NetworkStatus =
  | 'REQUESTING_CONFIGURATION'
  | 'OK'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'PORT_ERROR'
  | 'CLIENT_TOO_OLD'
  | 'AUTHENTICATION_REQUIRED'
  | 'DISCONNECTED'

export interface Dns {
  domain?: string
  servers?: string[]
}

export type NetworkType = 'PUBLIC' | 'PRIVATE'

export interface MulticastSubscription {
  adi?: number
  mac?: string
}

export interface Route {
  flags?: number
  metric?: number
  target?: string
  via?: string
}

export interface Status {
  address?: string
  clock?: number
  config?: Config
  online?: boolean
  planetWorldId?: number
  planetWorldTimestamp?: number
  publicIdentity?: string
  tcpFallbackActive?: boolean
  version?: string
  versionBuild?: number
  versionMajor?: number
  versionMinor?: number
  versionRev?: number
}

export interface Config {
  settings?: Settings
}

export interface Settings {
  allowTcpFallbackRelay?: boolean
  portMappingEnabled?: boolean
  primaryPort?: number
}

export interface Peer {
  address?: string
  isBonded?: boolean
  latency?: number
  paths?: Path[]
  role?: string
  version?: string
  versionMajor?: number
  versionMinor?: number
  versionRev?: number
}

export interface Path {
  active?: boolean
  address?: string
  expired?: boolean
  lastReceive?: number
  lastSend?: number
  preferred?: boolean
  trustedPathId?: number
}
