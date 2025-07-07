// Mock React Native modules

jest.doMock(
  'react-native',
  () => ({
    __esModule: true,
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    DeviceEventEmitter: null,
    Platform: { OS: 'ios' },
  }),
  { virtual: true }
)

jest.doMock('@exodus/netinfo', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getConnectionInfo: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
}))

const { default: appProcessMobile } = await import('@exodus/app-process-mobile')
const { default: createAdapters } = await import('./adapters/index.js')
const { default: config } = await import('./config.js')
const { default: createExodus } = await import('./exodus.js')

describe('app-process-mobile', () => {
  let appStateHistoryAtom
  let exodus
  let reportNode

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    const adapters = createAdapters()

    const container = createExodus({ adapters, config })
    container.registerMultiple(appProcessMobile().definitions)

    exodus = container.resolve()
    reportNode = container.getByType('report').appProcessReport
    appStateHistoryAtom = container.get('appStateHistoryAtom')

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
  })

  afterEach(() => exodus.application.stop())

  test('should successfully export report', async () => {
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      appProcess: await reportNode.export(),
    })

    const transitions = [
      {
        from: 'active',
        to: 'inactive',
        timestamp: new Date(),
        timeInBackground: 0,
        timeLastBackgrounded: 0,
      },
      {
        from: 'inactive',
        to: 'background',
        timestamp: new Date(),
        timeInBackground: 5000,
        timeLastBackgrounded: 5000,
      },
    ]

    appStateHistoryAtom.set(transitions)

    await expect(reportNode.export()).resolves.toEqual({
      history: transitions.map((transition) => ({
        ...transition,
        timestamp: transition.timestamp.toISOString(),
      })),
      startTime: expect.any(String),
    })
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      appProcess: await reportNode.export(),
    })
  })
})
