import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('attach plugins', () => {
  let container
  let exodus
  let adapters = createAdapters()
  let pluginApi

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    pluginApi = {
      onCreate: jest.fn(),
      onUnlock: jest.fn(),
    }

    container = createExodus({ adapters, config })
    container.register({
      definition: {
        id: 'testPlugin',
        type: 'plugin',
        factory: () => {
          return pluginApi
        },
        dependencies: [],
        public: true,
      },
    })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
  })

  afterEach(() => exodus.application.stop())

  test('built-in plugin is attached', () => {
    expect(typeof container.get('logLifecyclePlugin').onCreate).toBe('function')
  })

  test('autoEnableAssetsPlugin is attached', () => {
    const { autoEnableAssetsPlugin } = container.getByType('plugin')
    expect(typeof autoEnableAssetsPlugin.onAssetsSynced).toBe('function')
  })

  test('should execute plugins for lifecycle methods', async () => {
    await exodus.wallet.create({ passphrase })
    expect(pluginApi.onCreate).toHaveBeenCalledTimes(1)

    await exodus.wallet.unlock({ passphrase })
    expect(pluginApi.onUnlock).toHaveBeenCalledTimes(1)
  })
})
