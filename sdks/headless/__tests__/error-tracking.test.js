import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

const passphrase = 'exceptionally-complex-secret'

describe('error-tracking preprocessors', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('error-tracking', async () => {
    // to have predictable value for Date.now
    let i = 0
    jest.spyOn(Date, 'now').mockImplementation(() => i++)

    const adapters = createAdapters()

    const container = createExodus({ adapters, config })

    container.register({
      definition: {
        id: 'voldieModule',
        type: 'module',
        namespace: 'voldie',
        factory: ({ errorTracking }) => {
          errorTracking.track({ error: 'error0', context: {} })
          return { v: () => 'voldie' }
        },
        dependencies: ['errorTracking'],
        public: true,
      },
    })

    container.register({
      definition: {
        id: 'harryModule',
        type: 'module',
        namespace: 'harry',
        factory: ({ errorTracking }) => {
          errorTracking.track({ error: 'error1', context: {} })
          return { v: () => 'harry' }
        },
        dependencies: ['errorTracking', 'voldieModule'],
        public: true,
      },
    })
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const report = await exodus.reporting.export()

    expect(exodus.errors.track).toBeDefined()
    expect(report.errorTracking).toEqual({
      errors: [
        {
          namespace: 'harry',
          context: {},
          error: 'error1',
          time: 1,
        },
        {
          namespace: 'voldie',
          context: {},
          error: 'error0',
          time: 0,
        },
      ],
    })
  })
})
