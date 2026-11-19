import createIocContainer from '@exodus/dependency-injection'
import createInMemoryStorage from '@exodus/storage-memory'

import preprocess from '../../src/index.js'
import namespaceStorage from '../../src/preprocessors/namespace-storage.js'

const logger = console

describe('`namespace-storage` integration tests', () => {
  it('namespaces storage', async () => {
    const ioc = createIocContainer({ logger })
    const store = new Map()
    const dependencies = [
      {
        definition: {
          id: 'harry',
          factory: (dependencies) => dependencies,
          dependencies: ['encryptedStorage'],
        },
        storage: {
          namespace: ['left', 'pocket'],
          interfaceId: 'encryptedStorage',
        },
      },
      {
        definition: {
          id: 'encryptedStorage',
          factory: () => createInMemoryStorage({ store }),
        },
      },
    ]

    const preprocessed = preprocess({
      dependencies,
      preprocessors: [namespaceStorage()],
    })

    ioc.registerMultiple(preprocessed)
    ioc.resolve()

    const { harry } = ioc.getAll()
    await harry.encryptedStorage.set('stone', "philosopher's stone")
    expect(store).toEqual(new Map([['!left!!pocket!stone', '"philosopher\'s stone"']]))
  })
})
