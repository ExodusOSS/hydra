import suite from '@exodus/storage-spec'

import MemoryStore from '../../__tests__/memory-store'
import createStorage from '../storage'

const TEST_TRANSFORM_PREFIX = 'encrypted'

const transformOnWrite = (value) => `${TEST_TRANSFORM_PREFIX}${JSON.stringify(value)}`

const transformOnRead = (value) => {
  const prefix = value.slice(0, TEST_TRANSFORM_PREFIX.length).toString()

  if (prefix !== TEST_TRANSFORM_PREFIX) throw new Error('unable to transform')

  return JSON.parse(value.slice(TEST_TRANSFORM_PREFIX.length))
}

describe('storage', () => {
  suite({ factory: () => createStorage({ store: new MemoryStore() }) })

  suite({
    factory: () =>
      createStorage({
        store: new MemoryStore(),
        transformOnWrite,
        transformOnRead,
      }),
  })
})
