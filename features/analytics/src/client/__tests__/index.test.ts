import type { Mock } from 'jest-mock'

jest.doMock('@exodus/analytics-validation', () => ({
  __esModule: true,
  default: () => {
    throw new Error('Always-failing validation')
  },
}))

const { default: clientDefinition } = await import('../index.js')

const testEvent = {
  event: 'TestEvent',
  properties: {
    abc: '123',
  },
}

describe('client', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn(async () => new Response(null, { status: 204 })) as unknown as Mock<
      typeof fetch
    > as typeof fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  const createCommonOpts = () => ({
    config: {
      segment: {
        apiKey: 'dummySegmentKey',
        apiBaseUrl: 'https://api.segment.io/v1/',
      },
    },
    getBuildMetadata: async () => ({
      dev: false,
    }),
    logger: console,
  })

  it('supports overriding validateAnalyticsEvent', async () => {
    expect(() =>
      clientDefinition.factory({
        ...createCommonOpts(),
        validateAnalyticsEvent: null as unknown as (event: unknown) => void,
      })
    ).toThrow(/validateEvent/)

    const validateAnalyticsEventDummy = jest.fn()
    const client = clientDefinition.factory({
      ...createCommonOpts(),
      validateAnalyticsEvent: validateAnalyticsEventDummy,
    })

    await client.track(testEvent)
    expect(validateAnalyticsEventDummy).toHaveBeenCalledWith(testEvent)
  })
})
