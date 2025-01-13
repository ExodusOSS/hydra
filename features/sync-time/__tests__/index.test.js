import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify'
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional'
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias'
import syncTime from '../'
import { EventEmitter } from 'events/'
import { SynchronizedTime } from '@exodus/basic-utils'

const createLogger = (namespace) => console

describe('sync-time', () => {
  it('should initialize sync-time via ioc', () => {
    const ioc = createIocContainer({ logger: console })
    const deps = preprocess({
      dependencies: [
        ...syncTime().definitions,
        {
          definition: {
            id: 'config',
            factory: () => ({
              syncTime: {
                interval: 1000,
              },
            }),
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
            id: 'port',
            factory: () => new EventEmitter(),
            public: true,
          },
        },
        {
          definition: {
            id: 'synchronizedTime',
            factory: () => SynchronizedTime,
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
