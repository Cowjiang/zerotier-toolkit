import { Path, Peer } from '../../../../typings/zerotier.ts'
import { peerConnection, peerLastReceive, peerLatency } from '../peerHelpers.ts'

const createPeer = (overrides: Partial<Peer>): Peer => ({
  address: 'aaaaaaaaaa',
  role: 'LEAF',
  ...overrides,
})

const createPath = (overrides: Partial<Path>): Path => ({
  address: '1.2.3.4/9993',
  active: true,
  preferred: true,
  expired: false,
  lastReceive: 1000,
  lastSend: 1000,
  ...overrides,
})

describe('peerHelpers', () => {
  it('should classify peer connections', () => {
    expect(peerConnection(createPeer({ paths: [createPath({})] }))).toBe('direct')
    expect(peerConnection(createPeer({ paths: [] }))).toBe('relayed')
    expect(peerConnection(createPeer({ paths: [createPath({})], tunneled: true }))).toBe('tunneled')
    expect(peerConnection(createPeer({ role: 'PLANET', paths: [] }))).toBe('idle')
  })

  it('should ignore expired paths when checking the connection', () => {
    expect(peerConnection(createPeer({ paths: [createPath({ active: false, expired: true })] }))).toBe('relayed')
  })

  it('should ignore negative latency values', () => {
    expect(peerLatency(createPeer({ latency: -1 }))).toBeUndefined()
    expect(peerLatency(createPeer({ latency: 42 }))).toBe(42)
  })

  it('should return the latest receive time from all paths', () => {
    expect(
      peerLastReceive(
        createPeer({
          paths: [
            createPath({ lastReceive: 1000 }),
            createPath({ lastReceive: 3000 }),
            createPath({ lastReceive: 2000 }),
          ],
        }),
      ),
    ).toBe(3000)
    expect(peerLastReceive(createPeer({ paths: [] }))).toBeUndefined()
  })
})
