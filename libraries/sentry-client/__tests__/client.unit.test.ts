import { mock } from 'node:test'

import { set } from '@exodus/basic-utils'
import { safeString } from '@exodus/safe-string'

const randomUUID = 'da30f8c1-ed49-494b-bc5a-5b3c160081fe'
const EVENT_ITEM_HEADER = { type: 'event' }

mock.module('@exodus/crypto/randomUUID', {
  namedExports: { randomUUID: () => randomUUID },
})
global.fetch = jest.fn()

const { default: createSentryClient } = await import('../src/index.js')

const fullTestConfig = {
  dsnUrl: 'https://publicKey@projectId.ingest.us.sentry.io',
  publicKey: 'publicKey',
  projectId: 'projectId',
  environment: 'staging',
  os: 'testos',
  osVersion: '1.2.3',
  platform: 'testplatform',
  appName: 'testapp',
  appVersion: '4.5.6',
  buildId: 'some-build-id',
  jsEngine: 'jsc',
}

const parseEnvelope = (envelope) => {
  const lines = envelope.split('\n')
  expect(lines).toHaveLength(3)

  return {
    header: JSON.parse(lines[0]),
    itemHeader: JSON.parse(lines[1]),
    payload: JSON.parse(lines[2]),
  }
}

const expectNumbers = (request) => {
  set(request, 'timestamp', expect.any(Number))
  set(
    request,
    'exception.values[0].stacktrace.frames',
    request.exception.values[0].stacktrace.frames.map((frame) => ({
      ...frame,
      lineno: frame.lineno ? expect.any(Number) : frame.lineno, // Expect `null` for frames that don't have a line number.
      colno: frame.colno ? expect.any(Number) : frame.colno, // Expect `null` for frames that don't have a column number.
    }))
  )

  return expect(request)
}

describe('config validation', () => {
  test('requires config.dsnUrl', () => {
    expect(() =>
      createSentryClient({
        config: {},
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.publicKey" of type String, got undefined"'
    )
  })

  test('requires config.publicKey', () => {
    expect(() =>
      createSentryClient({
        config: {
          dsnUrl: 'https://...',
        },
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.publicKey" of type String, got undefined"'
    )
  })

  test('requires config.projectId', () => {
    expect(() =>
      createSentryClient({
        config: {
          dsnUrl: 'https://...',
          publicKey: 'abc',
        },
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.projectId" of type String, got undefined"'
    )
  })

  test('requires config.environment', () => {
    expect(() =>
      createSentryClient({
        config: {
          dsnUrl: 'https://...',
          publicKey: 'abc',
          projectId: '123',
        },
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.environment" of type environment, got undefined"'
    )
  })

  test('validates config.environment', () => {
    expect(() =>
      createSentryClient({
        config: {
          dsnUrl: 'https://...',
          publicKey: 'abc',
          projectId: '123',
          environment: '%^&',
        },
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.environment" of type environment, got String "%^&""'
    )

    expect(() =>
      createSentryClient({
        config: fullTestConfig,
      })
    ).not.toThrow()
  })
})

describe('captureError', () => {
  let client
  beforeEach(() => {
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() => 1_234_567_890_123)

    client = createSentryClient({
      config: fullTestConfig,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('sends error', async () => {
    await client.captureError({
      error: new Error('boo'),
    })

    expect(global.fetch.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('sends error with safe string', async () => {
    await client.captureError({
      error: new Error(safeString`My seed phrase is ${'not a real seed phrase'}`),
    })

    expect(global.fetch.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('sets os/platform metadata', async () => {
    client = createSentryClient({
      config: fullTestConfig,
    })

    await client.captureError({
      error: new Error('boo'),
    })

    expect(global.fetch.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('sets custom tags and metadata', async () => {
    client = createSentryClient({
      config: fullTestConfig,
    })

    await client.captureError({
      error: new Error('boo'),
      tags: {
        a: '1',
      },
      metadata: {
        b: '2',
      },
    })

    expect(global.fetch.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('sets custom context', async () => {
    client = createSentryClient({
      config: fullTestConfig,
    })

    await client.captureError({
      error: new Error('boo'),
      context: {
        navigation: {
          currentRouteName: safeString`home`,
          previousRouteName: safeString`login`,
        },
      },
    })

    expect(global.fetch.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('throws when error is not an Error instance', async () => {
    client = createSentryClient({
      config: fullTestConfig,
    })

    await expect(
      client.captureError({
        error: {
          stack: 'not a real stack',
        },
      })
    ).rejects.toThrow("'error' must be an Error instance.")
  })

  describe('hermes: safe vs dangerous', () => {
    let client
    beforeEach(() => {
      client = createSentryClient({
        config: {
          ...fullTestConfig,
          jsEngine: 'hermes',
        },
      })
    })

    test('captureError omits error message', async () => {
      await client.captureError({ error: new Error('boo') })

      expect(global.fetch.mock.calls[0][0]).toEqual(
        new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
      )
      const { header, itemHeader, payload } = parseEnvelope(global.fetch.mock.calls[0][1].body)
      expect(header.event_id).toEqual(payload.event_id)
      expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
      expectNumbers(payload).toMatchSnapshot()
    })
  })
})
