import { describe, test } from 'node:test'

import { safeString } from '@exodus/safe-string'

import { SafeError } from '../../safe-error.js'

describe('safeString', () => {
  test('should pass through safeString', () => {
    const err = new Error(safeString`hello ${'world'}`)
    expect(SafeError.from(err).hint).toBe('hello <redacted>')
  })

  test('should pass through safeString with no interpolated values', () => {
    const err = new Error(safeString`hello world 2`)
    expect(SafeError.from(err).hint).toBe('hello world 2')
  })

  test('should pass through safeString with interpolated values', () => {
    const safeVariable = safeString`world 3`
    const err = new Error(safeString`hello ${safeVariable}`)
    expect(SafeError.from(err).hint).toBe('hello world 3')
  })
})
