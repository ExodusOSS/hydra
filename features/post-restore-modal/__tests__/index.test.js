import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify'
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional'
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias'
import createInMemoryStorage from '@exodus/storage-memory'
import postRestoreModal from '../'
import { createInMemoryAtom } from '@exodus/atoms'

const createLogger = (namespace) => console

describe('post-restore-modal', () => {
  it('should initialize post-restore-modal via ioc', () => {
    const ioc = createIocContainer({ logger: console })
    const deps = preprocess({
      dependencies: [
        ...postRestoreModal().definitions,
        {
          definition: {
            id: 'port',
            factory: () => ({ emit: jest.fn() }),
            public: true,
          },
        },
        {
          definition: {
            id: 'storage',
            factory: createInMemoryStorage,
            public: true,
          },
        },
        {
          definition: {
            id: 'unsafeStorage',
            factory: createInMemoryStorage,
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
        {
          definition: {
            id: 'syncedBalancesAtom',
            factory: () => createInMemoryAtom({}),
            public: true,
          },
        },
        {
          definition: {
            id: 'balancesAtom',
            factory: () => createInMemoryAtom({}),
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
