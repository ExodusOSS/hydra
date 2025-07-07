import { SafeError } from '@exodus/errors'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

const passphrase = 'exceptionally-complex-secret'

describe('error-tracking preprocessors', () => {
  let exodus
  let time
  let reportNode

  beforeEach(async () => {
    // to have predictable value for Date.now
    time = new Date('2024-12-10').getTime()
    jest.spyOn(Date, 'now').mockImplementation(() => time)

    const adapters = createAdapters()

    const container = createExodus({ adapters, config })

    container.register({
      definition: {
        id: 'voldieModule',
        type: 'module',
        namespace: 'voldie',
        factory: ({ errorTracking }) => {
          errorTracking.track({ error: new Error('error0'), context: {} })
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
          errorTracking.track({ error: new Error('error1'), context: {} })
          return { v: () => 'harry' }
        },
        dependencies: ['errorTracking', 'voldieModule'],
        public: true,
      },
    })
    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    reportNode = container.getByType('report').errorTrackingReport
  })

  afterEach(async () => {
    await exodus.application.stop()
    jest.restoreAllMocks()
  })

  it('error-tracking', async () => {
    const report = await exodus.reporting.export()

    expect(exodus.errors.track).toBeDefined()
    expect(report.errors).toEqual({
      errors: [
        {
          namespace: 'harry',
          error: expect.any(SafeError),
          time,
        },
        {
          namespace: 'voldie',
          error: expect.any(SafeError),
          time,
        },
      ],
    })
  })

  test('should successfully export report', async () => {
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      errors: await reportNode.export(),
    })
  })
})
