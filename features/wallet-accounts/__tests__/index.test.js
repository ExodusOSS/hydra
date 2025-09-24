import EventEmitter from 'node:events'

import createIOC from '@exodus/argo'
import fusionLocalDefinition from '@exodus/fusion-local/module'
import createLogger from '@exodus/logger'
import createInMemoryStorage from '@exodus/storage-memory'

import walletAccounts from '../index.js'

describe('wallet accounts feature', () => {
  let ioc

  const errorTracking = { track: jest.fn() }

  const createDefinition = (id, value) => ({
    definition: {
      id,
      type: 'module',
      factory: () => value,
      public: true,
    },
  })

  beforeEach(() => {
    const storage = createInMemoryStorage()
    ioc = createIOC({
      adapters: {
        createLogger,
        unsafeStorage: storage,
      },
    })

    ioc.registerMultiple([
      createDefinition('wallet', {}),
      createDefinition('storage', storage),
      createDefinition('port', new EventEmitter()),
      createDefinition('logger', createLogger()),
      createDefinition('unsafeStorage', storage),
      createDefinition('errorTracking', errorTracking),
      createDefinition('config', {}),
      { definition: fusionLocalDefinition },
    ])
  })

  test('does not explode', () => {
    ioc.use(walletAccounts())
    expect(() => ioc.resolve()).not.toThrow()
  })

  test('does not expose allWalletAccountsEver to other features', () => {
    const otherFeature = {
      id: 'other',
      definitions: [
        {
          definition: {
            type: 'module',
            id: 'greedilyTryingToAccessPrivateFeatures',
            factory: () => 42,
            dependencies: ['allWalletAccountsEver'],
            public: true,
          },
        },
      ],
    }

    ioc.use(walletAccounts())
    ioc.use(otherFeature)

    expect(() => ioc.resolve()).toThrow('Requested private dependency')
  })
})
