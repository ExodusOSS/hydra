import { describe, test } from 'node:test'

import { safeString } from '@exodus/safe-string'

import { SafeError } from '../../safe-error.js'

describe('safeString', () => {
  test('should pass through safeString', () => {
    const err = new Error(safeString`hello ${'world'}`)
    expect(SafeError.from(err).hint).toBe('hello <redacted>')
  })
})
