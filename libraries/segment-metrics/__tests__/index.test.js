const Tracker = require('../index')

class SchemaSafeValidationError extends Error {
  constructor(message, { keyword, instanceLocation }) {
    super(message)
    this.name = 'SchemaSafeValidationError'
    this.keyword = keyword
    this.instanceLocation = instanceLocation
  }
}

const createTracker = ({
  dev = false,
  hasMockValidationError = false,
  apiBaseUrl = 'https://fake-segment-api-url',
  validateEvent,
  fetch,
} = {}) => {
  return new Tracker({
    writeKey: '',
    apiBaseUrl,
    fetch,
    validateEvent:
      validateEvent ||
      (() => {
        if (hasMockValidationError) throw new Error('fail')
      }),
    getBuildMetadata: async () => ({
      dev,
    }),
    logger: console,
  })
}

describe('constructor', () => {
  it('non-URI baseURL is not allowed', () => {
    expect(() => new Tracker({ apiBaseUrl: 'hello, this is random text' })).toThrow(TypeError)
  })

  it('apiBaseUrl with "http" protocol is not allowed', () => {
    expect(() => new Tracker({ apiBaseUrl: 'http://not-secure.io/' })).toThrow(URIError)
  })

  it('non-function validateEvent is not allowed', () => {
    expect(() => new Tracker({ apiBaseUrl: 'https//valid-url/', validateEvent: 10 })).toThrow(
      TypeError
    )
  })
})

describe('setAnonymousId', () => {
  it('should set anonymousId', () => {
    const tracker = createTracker()
    tracker.setAnonymousId('some-id')
    expect(tracker.anonymousId).toBe('some-id')
  })
})

describe('setDefaultProperty', () => {
  it('should set with correct key/value', () => {
    const tracker = createTracker()
    tracker.setDefaultProperty('some_prop', 'some-value')
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
  })

  it('should set with snake_cased key', () => {
    const tracker = createTracker()
    tracker.setDefaultProperty('someProp', 'some-value')
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
  })
})

describe('setDefaultProperties', () => {
  it('should set with correct object', () => {
    const tracker = createTracker()
    tracker.setDefaultProperties({
      some_prop: 'some-value',
      another_prop: 'another-value',
    })
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
    expect(tracker.defaultProperties.another_prop).toBe('another-value')
  })

  it('should set with snake_cased object keys', () => {
    const tracker = createTracker()
    tracker.setDefaultProperties({
      someProp: 'some-value',
      anotherProp: 'another-value',
    })
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
    expect(tracker.defaultProperties.another_prop).toBe('another-value')
  })

  it('should overwrite existing values', () => {
    const tracker = createTracker()
    tracker.setDefaultProperty('overwriteThisProp', 'overwrite-this-value')
    expect(tracker.defaultProperties.overwrite_this_prop).toBe('overwrite-this-value')

    tracker.setDefaultProperties({
      someProp: 'some-value',
      overwriteThisProp: 'overwritten-value',
    })
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
    expect(tracker.defaultProperties.overwrite_this_prop).toBe('overwritten-value')
  })
})

describe('removeDefaultProperty', () => {
  it('should remove key', () => {
    const tracker = createTracker()
    tracker.setDefaultProperty('someProp', 'some-value')
    expect(tracker.defaultProperties.some_prop).toBe('some-value')

    tracker.removeDefaultProperty('some_prop')
    expect(tracker.defaultProperties.some_prop).toBeUndefined()
  })

  it('should removed snaked key', () => {
    const tracker = createTracker()
    tracker.setDefaultProperty('someProp', 'some-value')
    expect(tracker.defaultProperties.some_prop).toBe('some-value')

    tracker.removeDefaultProperty('someProp')
    expect(tracker.defaultProperties.some_prop).toBeUndefined()
  })
})

describe('removeAllDefaultProperties', () => {
  it('should remove all default properties', () => {
    const tracker = createTracker()
    tracker.setDefaultProperties({
      some_prop: 'some-value',
      another_prop: 'another-value',
    })
    expect(tracker.defaultProperties.some_prop).toBe('some-value')
    expect(tracker.defaultProperties.another_prop).toBe('another-value')

    tracker.removeAllDefaultProperties()
    expect(tracker.defaultProperties.some_prop).toBeUndefined()
    expect(tracker.defaultProperties.another_prop).toBeUndefined()
  })
})

describe('setDefaultPropertiesForSanitizationErrors', () => {
  it('should set with correct object', () => {
    const tracker = createTracker()
    tracker.setDefaultPropertiesForSanitizationErrors({
      some_prop: 'some-value',
      another_prop: 'another-value',
    })
    expect(tracker.errorProperties.some_prop).toBe('some-value')
    expect(tracker.errorProperties.another_prop).toBe('another-value')
  })

  it('should set with snake_cased object keys', () => {
    const tracker = createTracker()
    tracker.setDefaultPropertiesForSanitizationErrors({
      someProp: 'some-value',
      anotherProp: 'another-value',
    })
    expect(tracker.errorProperties.some_prop).toBe('some-value')
    expect(tracker.errorProperties.another_prop).toBe('another-value')
  })

  it('should overwrite existing values', () => {
    const tracker = createTracker()
    tracker.setDefaultPropertiesForSanitizationErrors({ overwriteThisProp: 'overwrite-this-value' })
    expect(tracker.errorProperties.overwrite_this_prop).toBe('overwrite-this-value')

    tracker.setDefaultPropertiesForSanitizationErrors({
      someProp: 'some-value',
      overwriteThisProp: 'overwritten-value',
    })
    expect(tracker.errorProperties.some_prop).toBe('some-value')
    expect(tracker.errorProperties.overwrite_this_prop).toBe('overwritten-value')
  })
})

describe('track', () => {
  let fetch
  let tracker

  beforeEach(() => {
    fetch = jest.fn(() => ({ status: 200, json: async () => {} }))
    tracker = createTracker({ fetch })
  })

  it('should create event', async () => {
    await tracker.track({ event: 'SomeEvent', properties: { some_prop: 'some-value' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.event).toBe('SomeEvent')
    expect(body.properties.some_prop).toBe('some-value')
  })

  it('should automatically set anonymousId if none provided', async () => {
    await tracker.track({ event: 'SomeEvent' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(typeof body.anonymousId).toBe('string')
  })

  it('should use anonymousId if provided', async () => {
    await tracker.track({ event: 'SomeEvent', anonymousId: 'some-id' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.anonymousId).toBe('some-id')
  })

  it('should PascalCase event names', async () => {
    await tracker.track({ event: 'someEvent' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.event).toBe('SomeEvent')
  })

  it('should set properties with snake_cased keys', async () => {
    await tracker.track({ event: 'SomeEvent', properties: { someProp: 'some-value' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.properties.some_prop).toBe('some-value')
  })

  it('should overwrite defaultProperties with explicit properties', async () => {
    tracker.setDefaultProperties({
      someProp: 'some-value',
      anotherProp: 'another-value',
    })

    await tracker.track({
      event: 'SomeEvent',
      properties: {
        someProp: 'some-explicit-value',
        anotherProp: 'another-explicit-value',
      },
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.properties.some_prop).toBe('some-explicit-value')
    expect(body.properties.another_prop).toBe('another-explicit-value')
  })

  it('should reset anonymousId if sensitive', async () => {
    tracker.setAnonymousId('some-id')

    await tracker.track({ event: 'SomeEvent', sensitive: true })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(typeof body.anonymousId).toBe('string')
    expect(body.anonymousId).not.toBe('some-id')
  })

  it('should attach timestamp', async () => {
    await tracker.track({ event: 'SomeEvent' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(typeof body.timestamp).toBe('string')
    expect(body.timestamp).toBe(new Date().toUTCString())
  })

  it('should use passed timestamp if provided', async () => {
    const timestamp = new Date('Tue, 01 Jan 2019 00:00:00 GMT')
    await tracker.track({ event: 'SomeEvent', timestamp })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(typeof body.timestamp).toBe('string')
    expect(body.timestamp).toBe('Tue, 01 Jan 2019 00:00:00 GMT')
  })

  it('should have obfuscated timestamp without exactTimestamp', async () => {
    await tracker.track({ event: 'SomeEvent', exactTimestamp: false })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(typeof body.timestamp).toBe('string')
    expect(body.timestamp).not.toBe(new Date().toUTCString())
  })

  it('should `track` with error message in dev mode', async () => {
    tracker = createTracker({ dev: true, hasMockValidationError: true, fetch })

    await tracker.track({ event: 'event', properties: { prop: 'prop' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body).toEqual({
      anonymousId: tracker.anonymousId,
      event: 'SanitizationError',
      properties: {
        event: 'Event',
        message: 'fail',
      },
    })
  })

  it('should `track` with validation failed error messages in prod mode', async () => {
    const tracker = createTracker({
      fetch,
      validateEvent: () => {
        throw new SchemaSafeValidationError(
          'JSON validation failed for minLength at #/properties/region',
          {
            keyword: 'minLength',
            instanceLocation: '#/properties/region',
          }
        )
      },
    })

    await tracker.track({ event: 'event', properties: { prop: 'prop' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body).toEqual({
      anonymousId: tracker.anonymousId,
      event: 'SanitizationError',
      properties: {
        event: 'Event',
        message: 'Validation failed for minLength at #/properties/region',
      },
    })
  })

  it('should `track` with other error names as message in prod mode', async () => {
    const tracker = createTracker({ hasMockValidationError: true, fetch })

    await tracker.track({ event: 'event', properties: { prop: 'prop' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body).toEqual({
      anonymousId: tracker.anonymousId,
      event: 'SanitizationError',
      properties: {
        event: 'Event',
        message: 'Error',
      },
    })
  })

  it('should not throw when succeeds validation', async () => {
    await expect(
      tracker.track({ event: 'event', properties: { prop: 'prop' } })
    ).resolves.not.toThrow()
  })

  it('should omit undefined properties', async () => {
    await tracker.track({
      event: 'event',
      properties: { prop: 'prop', myUndefinedProp: undefined },
    })

    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.properties).not.toHaveProperty('my_undefined_prop')
  })

  it('should make the request to configured endpoint', async () => {
    const apiBaseUrl = 'https://totally-not-correct/endpoint/v3/'

    const tracker = createTracker({ apiBaseUrl, fetch })
    await tracker.track({ event: 'SomeEvent', properties: { some_prop: 'some-value' } })

    expect(fetch).toHaveBeenCalledWith(new URL('track', apiBaseUrl), expect.anything())
  })
})

describe('identify', () => {
  let fetch
  let tracker

  beforeEach(() => {
    fetch = jest.fn(() => ({ status: 200, json: async () => {} }))
    tracker = createTracker({ fetch })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should create traits', async () => {
    await tracker.identify({ traits: { some_trait: 'some-value' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.traits.some_trait).toBe('some-value')
  })

  it('should use anonymousId if provided', async () => {
    await tracker.identify({ anonymousId: 'some-id' })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.anonymousId).toBe('some-id')
  })

  it('should set traits with snake_cased keys', async () => {
    await tracker.identify({ anonymousId: 'some-id', traits: { someTrait: 'some-value' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.traits.some_trait).toBe('some-value')
  })

  it('should attach timestamp', async () => {
    const date = new Date('2021-01-01T00:00:00Z')
    jest.useFakeTimers().setSystemTime(date)

    await tracker.identify({ traits: { some_trait: 'some-value' } })
    const body = JSON.parse(fetch.mock.calls[0][1].body)

    expect(body.timestamp).toEqual(date.toUTCString())
  })

  it('should make the request to configured endpoint', async () => {
    const apiBaseUrl = 'https://totally-not-correct/endpoint/v3/'

    const tracker = createTracker({ apiBaseUrl, fetch })
    await tracker.identify({ traits: { some_trait: 'some-value' } })

    expect(fetch).toHaveBeenCalledWith(new URL('identify', apiBaseUrl), expect.anything())
  })
})
