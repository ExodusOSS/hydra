import { describe, it } from 'node:test'
import { expect } from 'expect'

import createStorage from '../src/index.js'

describe('transformOnRead/transformOnWrite', () => {
  it('uses JSON.parse/stringify as default transforms', async () => {
    const store = new Map()
    const storage = createStorage({ store })

    await storage.set('harry', 'run')
    expect(await storage.get('harry')).toEqual('run')
    expect(store).toEqual(new Map([['harry', '"run"']]))
  })

  it('supports custom transform on read/write', async () => {
    const store = new Map()
    const storage = createStorage({
      store,
      transformOnWrite: async (value) => value + '!',
      transformOnRead: async (value) => value.slice(0, -1),
    })

    await storage.set('harry', 'run')
    expect(await storage.get('harry')).toEqual('run')
    expect(store).toEqual(new Map([['harry', 'run!']]))
  })
})
