import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

const hogwarts = {
  id: 'howgarts',
  definitions: [
    {
      definition: {
        id: 'hogwartsDebug',
        type: 'debug',
        factory: () => ({ hogwarts: { openChamberOfSecrets: () => {} } }),
        dependencies: [],
        public: true,
      },
    },
  ],
}

describe('debug', () => {
  test('should not expose debug apis', async () => {
    const adapters = createAdapters()

    const container = createExodus({ adapters, config })

    container.use(hogwarts)

    const exodus = container.resolve()

    expect(exodus.debug).toBe(undefined)
  })

  test('should expose debug apis when passed flag', async () => {
    const adapters = createAdapters()

    const container = createExodus({ adapters, config, debug: true })

    container.use(hogwarts)

    const exodus = container.resolve()

    expect(exodus.debug).not.toBe(undefined)
    expect(exodus.debug.hogwarts).toHaveProperty('openChamberOfSecrets')
  })
})
