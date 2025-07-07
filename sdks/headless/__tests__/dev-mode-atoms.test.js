import { createStorageAtomFactory } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import delay from 'delay'
import lodash from 'lodash'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

const { cloneDeep } = lodash

const advance = async (ms) => {
  jest.advanceTimersByTime(ms)
  await new Promise(setImmediate)
}

describe('devModeAtoms preprocessors', () => {
  let adapters

  let port

  let voldieAtom
  let logger

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    adapters = createAdapters()

    port = adapters.port

    logger = {
      error: jest.fn(),
      warn: jest.fn(),
    }

    const configWithLogger = cloneDeep(config)
    configWithLogger.ioc.devModeAtoms.logger = logger
    configWithLogger.ioc.devModeAtoms.swallowObserverErrors = true
    const container = createExodus({
      adapters,
      config: configWithLogger,
      port,
    })

    container.register({
      definition: {
        id: 'voldieAtom',
        type: 'atom',
        factory: () =>
          createStorageAtomFactory({ storage: createInMemoryStorage(), logger })({
            key: 'voldie',
            isSoleWriter: true,
          }),
        public: true,
      },
    })

    container.resolve()
    voldieAtom = container.get('voldieAtom')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('times observers out and swallows errors', async () => {
    voldieAtom.observe(() => delay(2000))
    await new Promise(setImmediate)

    voldieAtom.set("don't wait up")
    await advance(2000)
    expect(logger.error).toHaveBeenCalledWith(
      '[voldieAtom]',
      'Observer threw error',
      new Error('Observer timed out!')
    )
  })

  it('warns on same value set', async () => {
    const value = { hey: 'ho' }
    await voldieAtom.set(value)
    await new Promise(setImmediate)

    await voldieAtom.set(value)
    await new Promise(setImmediate)
    expect(logger.warn).toHaveBeenCalledWith(
      '[voldieAtom]',
      `Atom was called with the same value it currently holds: ${JSON.stringify(value)}`
    )
  })
})
