import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify.js'
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional.js'
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms.js'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias.js'
import createInMemoryStorage from '@exodus/storage-memory'
import fusionLocal from '../index.js'

const createLogger = (namespace) => console

describe('fusion-local', () => {
  it('should initialize fusion-local via ioc', () => {
    const ioc = createIocContainer({ logger: console })
    const deps = preprocess({
      dependencies: [
        ...fusionLocal().definitions,
        {
          definition: {
            id: 'storage',
            factory: createInMemoryStorage,
            public: true,
          },
        },
        {
          definition: {
            id: 'migrateableStorage',
            factory: () => ({ unlock: () => null }),
            public: true,
          },
        },
        {
          definition: {
            id: 'config',
            factory: () => ({}),
            public: true,
          },
        },
        {
          definition: {
            id: 'logger',
            factory: createLogger,
            public: true,
          },
        },
      ],
      preprocessors: [
        //
        logify({ createLogger }),
        alias(),
        optional(),
        readOnlyAtoms({
          logger: createLogger(),
          warn: false,
        }),
      ],
    })

    ioc.registerMultiple(deps)
    expect(() => ioc.resolve()).not.toThrow()
  })
})
