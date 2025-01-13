import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import sanitizeErrorMessage from '../sanitize.js'
import { naughtyMessages } from '@exodus/errors-fixture'

describe('sanitizeErrorMessage', () => {
  for (const { name, input, output } of naughtyMessages) {
    test(name, () => {
      assert.equal(sanitizeErrorMessage(input), output)
    })
  }
})
