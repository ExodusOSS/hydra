import { asRelativePath } from '../src/utils.js'

describe('asRelativePath', () => {
  test('returns pathname for valid relative path', () => {
    expect(asRelativePath('/api/v1/test')).toBe('/api/v1/test')
  })

  test('returns pathname for path with query parameters', () => {
    expect(asRelativePath('/api/v1/test?foo=bar')).toBe('/api/v1/test')
  })

  test('returns pathname for path with hash', () => {
    expect(asRelativePath('/api/v1/test#section')).toBe('/api/v1/test')
  })

  test('returns root path for empty string', () => {
    expect(asRelativePath('')).toBe('/')
  })

  test('returns root path for root slash', () => {
    expect(asRelativePath('/')).toBe('/')
  })

  test('handles path without leading slash', () => {
    expect(asRelativePath('api/v1/test')).toBe('/api/v1/test')
  })

  test('handles path with double slashes in middle', () => {
    expect(asRelativePath('/api//v1//test')).toBe('/api//v1//test')
  })

  test('handles path with special characters', () => {
    expect(asRelativePath('/api/v1/test%20space')).toBe('/api/v1/test%20space')
  })

  test('handles path with unicode characters', () => {
    expect(asRelativePath('/api/v1/测试')).toBe('/api/v1/%E6%B5%8B%E8%AF%95')
  })

  test('throws error when attempting to change origin with absolute URL', () => {
    expect(() => asRelativePath('https://different-origin.com/api/v1/test')).toThrow(
      'Changing origin is not allowed'
    )
  })

  test('throws error when attempting to change origin with protocol-relative URL', () => {
    expect(() => asRelativePath('//different-origin.com/api/v1/test')).toThrow(
      'Changing origin is not allowed'
    )
  })

  test('throws error for different http origin', () => {
    expect(() => asRelativePath('http://different-origin.com/api')).toThrow(
      'Changing origin is not allowed'
    )
  })

  test('throws error for ftp protocol', () => {
    expect(() => asRelativePath('ftp://different-origin.com/file')).toThrow(
      'Changing origin is not allowed'
    )
  })

  test('handles deeply nested paths', () => {
    expect(asRelativePath('/a/b/c/d/e/f/g/h/i/j/k')).toBe('/a/b/c/d/e/f/g/h/i/j/k')
  })

  test('handles path with dots for navigation', () => {
    expect(asRelativePath('/api/../test')).toBe('/test')
  })

  test('handles path with current directory dot', () => {
    expect(asRelativePath('/api/./test')).toBe('/api/test')
  })

  test('handles complex path with multiple dots', () => {
    expect(asRelativePath('/api/v1/../v2/./test')).toBe('/api/v2/test')
  })

  test('handles path that tries to go above root', () => {
    expect(asRelativePath('/../../../test')).toBe('/test')
  })

  test('preserves trailing slash', () => {
    expect(asRelativePath('/api/v1/')).toBe('/api/v1/')
  })

  test('handles encoded characters in path', () => {
    expect(asRelativePath('/api/v1/test%2Fencoded')).toBe('/api/v1/test%2Fencoded')
  })
})
