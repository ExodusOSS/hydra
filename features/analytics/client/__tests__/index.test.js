import clientDefinition from '../index.js'

const event = {
  event: 'TestEvent',
  properties: {
    abc: '123',
  },
}

describe('client', () => {
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
    fetch: jest.fn(),
  })

  it('supports overriding validateAnalyticsEvent', async () => {
    expect(() =>
      clientDefinition.factory({
        ...createCommonOpts(),
        validateAnalyticsEvent: null,
      })
    ).toThrow(/validateEvent/)

    const validateAnalyticsEventDummy = jest.fn()
    const client = clientDefinition.factory({
      ...createCommonOpts(),
      validateAnalyticsEvent: validateAnalyticsEventDummy,
    })

    await client.track(event)
    expect(validateAnalyticsEventDummy).toBeCalledWith(event)
  })
})
