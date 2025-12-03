import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import createIOC from '@exodus/argo'
import { createNoopLogger } from '@exodus/logger'

import cachedSodiumEncryptor from '../index.js'

describe('cached-sodium-encryptor', () => {
  test('initializes cached-sodium-encryptor via ioc', () => {
    const ioc = createIOC({ adapters: { createLogger: createNoopLogger } })
    ioc.use(cachedSodiumEncryptor())

    ioc.registerMultiple([
      {
        definition: {
          id: 'keychain',
          factory: () => ({}),
        },
      },
    ])

    assert.doesNotThrow(() => ioc.resolve())
  })
})
