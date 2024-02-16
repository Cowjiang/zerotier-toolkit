import formatTimestamp from '../formatDate.ts'

describe('formatDate', () => {
  it('should convert timestamp to string', () => {
    // Unix timestamp in seconds
    expect(formatTimestamp(1704038401)).toBe('2024-01-01 00:00:01')
    // Unix timestamp in milliseconds
    expect(formatTimestamp(1704038401999)).toBe('2024-01-01 00:00:01')
  })
})
