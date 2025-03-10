import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { naughtyMessages } from '@exodus/errors-fixture'

import sanitizeErrorMessage from '../sanitize.js'

void describe('sanitizeErrorMessage', () => {
  for (const { name, input, output } of naughtyMessages) {
    void test(name, () => {
      assert.equal(sanitizeErrorMessage(input), output)
    })
  }
})
