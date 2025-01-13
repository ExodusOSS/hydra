import { describe, it } from 'node:test'
import { expect } from 'expect'

import createStorage from '../src/index.js'

describe('validation', () => {
  class Potter {}

  for (const { key, value, name } of [
    {
      key: 'harry',
      value: new Potter(),
      name: 'top-level-non-plain',
    },
    {
      key: 'lily',
      value: { nested: new Potter() },
      name: 'nested-non-plain',
    },
    {
      key: 'voldemort',
      value: { encryptionKey: Buffer.from('avada kedavra') },
      name: 'native-non-plain',
    },
  ]) {
    it(`rejects ${name}`, async () => {
      const storage = createStorage()

      await expect(storage.set(key, value)).rejects.toThrow(/plain/)
    })
  }

  for (const { key, value, name } of [
    {
      key: 'harry',
      value: { scars: 1 },
      name: 'top-level-plain',
    },
    {
      key: 'lily',
      value: { kids: ['harry'] },
      name: 'nested-non-plain',
    },
    {
      key: 'voldemort',
      value: [],
      name: 'plain-array',
    },
    {
      key: 'longbottom',
      value: [{ a: { b: { c: undefined } } }, { b: null }],
      name: 'ignores-undefineds-but-not-null',
    },
  ]) {
    it(`accepts ${name}`, async () => {
      const storage = createStorage()

      await expect(storage.set(key, value)).resolves.not.toThrow(/plain/)
    })
  }
})
