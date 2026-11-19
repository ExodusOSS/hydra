import { mock } from 'node:test'

import { set } from '@exodus/basic-utils'
import { safeString } from '@exodus/safe-string'
import { TraceId } from '@exodus/traceparent'

import type { SentryConfig, SentryError, SentryStackFrame } from '../src/types.js'

const randomUUID = 'da30f8c1-ed49-494b-bc5a-5b3c160081fe'
const EVENT_ITEM_HEADER = { type: 'event' }

mock.module('@exodus/crypto/randomUUID', {
  namedExports: { randomUUID: () => randomUUID },
})
global.fetch = jest.fn()
const fetchMock = global.fetch as jest.Mock

const { default: createSentryClient, toSentryError } = await import('../src/index.js')

const fullTestConfig: SentryConfig = {
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

const parseEnvelope = (envelope: string) => {
  const lines = envelope.split('\n')
  expect(lines).toHaveLength(3)

  return {
    header: JSON.parse(lines[0]!),
    itemHeader: JSON.parse(lines[1]!),
    payload: JSON.parse(lines[2]!),
  }
}

const expectNumbers = (request: SentryError) => {
  set(request, 'timestamp', expect.any(Number))
  set(
    request,
    'exception.values[0].stacktrace.frames',
    request.exception.values[0]!.stacktrace.frames.map((frame: SentryStackFrame) => ({
      ...frame,
      lineno: frame.lineno ? expect.any(Number) : frame.lineno, // Expect `null` for frames that don't have a line number.
      colno: frame.colno ? expect.any(Number) : frame.colno, // Expect `null` for frames that don't have a column number.
    }))
  )

  return expect(request)
}

// `fetchMock` is module-level, so reset it between every test to stop one describe block's
// captureError calls from leaking into another's `fetchMock.mock.calls[0]` lookups.
afterEach(() => {
  fetchMock.mockClear()
})

describe('config validation', () => {
  test('requires config.dsnUrl', () => {
    expect(() =>
      createSentryClient({
        // @ts-expect-error -- intentionally invalid: tests runtime typeforce check
        config: {},
      })
    ).toThrowErrorMatchingInlineSnapshot(
      '"Expected property "config.publicKey" of type String, got undefined"'
    )
  })

  test('requires config.publicKey', () => {
    expect(() =>
      createSentryClient({
        // @ts-expect-error -- intentionally invalid
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
        // @ts-expect-error -- intentionally invalid
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
        // @ts-expect-error -- intentionally invalid
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
          // @ts-expect-error -- intentionally invalid environment value
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

describe('toSentryError', () => {
  test('returns undefined when stackFrames is undefined', () => {
    const error = new Error('test')
    error.stack = undefined
    const result = toSentryError({
      unsafeError: error,
      config: fullTestConfig,
    })

    expect(result).toBeUndefined()
  })
})

describe('linked errors (cause chain)', () => {
  test('serializes a single cause oldest-first, primary last', () => {
    const result = toSentryError({
      unsafeError: new Error(safeString`boom`, { cause: new Error(safeString`root cause`) }),
      config: fullTestConfig,
    })

    const values = result!.exception.values
    expect(values).toHaveLength(2)

    // oldest (cause) first
    expect(values[0]!.value).toEqual('root cause')
    expect(values[0]!.mechanism).toEqual({ type: 'generic', source: 'cause' })

    // primary (thrown) error last, unchanged shape (no mechanism)
    expect(values[1]!.value).toEqual('boom')
    expect(values[1]!.mechanism).toBeUndefined()

    // every value carries its own stack trace
    for (const value of values) {
      expect(Array.isArray(value.stacktrace.frames)).toBe(true)
    }
  })

  test('serializes a multi-level chain ordered oldest-first', () => {
    const error = new Error(safeString`a`, {
      cause: new Error(safeString`b`, { cause: new Error(safeString`c`) }),
    })
    const result = toSentryError({ unsafeError: error, config: fullTestConfig })

    expect(result!.exception.values.map((value) => value.value)).toEqual(['c', 'b', 'a'])
  })

  test('captureError sends the full cause chain in the envelope', async () => {
    const client = createSentryClient({ config: fullTestConfig })
    await client.captureError({
      error: new Error(safeString`outer`, { cause: new Error(safeString`inner cause`) }),
    })

    const { payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
    expect(payload.exception.values.map((value: { value?: string }) => value.value)).toEqual([
      'inner cause',
      'outer',
    ])
  })

  test('includes a cause without a stack, with empty frames', () => {
    const cause = new Error(safeString`frameless cause`)
    cause.stack = undefined
    const result = toSentryError({
      unsafeError: new Error(safeString`boom`, { cause }),
      config: fullTestConfig,
    })

    const values = result!.exception.values
    expect(values).toHaveLength(2)
    expect(values[0]!.value).toEqual('frameless cause')
    expect(values[0]!.stacktrace.frames).toEqual([])
  })

  test('still returns undefined when the primary error has no stack', () => {
    const error = new Error(safeString`boom`, { cause: new Error(safeString`root cause`) })
    error.stack = undefined
    const result = toSentryError({ unsafeError: error, config: fullTestConfig })

    expect(result).toBeUndefined()
  })
})

describe('captureError', () => {
  let client: ReturnType<typeof createSentryClient>
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

    expect(fetchMock.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('sends error with safe string', async () => {
    await client.captureError({
      error: new Error(safeString`My seed phrase is ${'not a real seed phrase'}`),
    })

    expect(fetchMock.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
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

    expect(fetchMock.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
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
      // @ts-expect-error -- intentionally extra: asserts captureError ignores tags/metadata
      tags: { a: '1' },
      metadata: { b: '2' },
    })

    expect(fetchMock.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
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

    expect(fetchMock.mock.calls[0][0]).toEqual(
      new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
    )
    const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
    expect(header.event_id).toEqual(payload.event_id)
    expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
    expectNumbers(payload).toMatchSnapshot()
  })

  test('promotes context.traceId into a Sentry trace context', async () => {
    const traceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-b7ad6b7169203331-01'

    await client.captureError({
      error: new Error('boo'),
      context: { traceId: TraceId.fromRawTraceparent(traceparent) },
    })

    const { payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
    expect(payload.contexts.trace).toEqual({
      trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
      span_id: randomUUID.replace(/-/gu, '').slice(0, 16),
    })
    expect(payload.contexts.traceId).toBeUndefined()
  })

  test('omits trace context when context has no traceId', async () => {
    await client.captureError({
      error: new Error('boo'),
      context: { navigation: { currentRouteName: safeString`home` } },
    })

    const { payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
    expect(payload.contexts.trace).toBeUndefined()
  })

  test('throws when error is not an Error instance', async () => {
    client = createSentryClient({
      config: fullTestConfig,
    })

    await expect(
      client.captureError({
        // @ts-expect-error -- intentionally not an Error instance: tests runtime guard
        error: {
          stack: 'not a real stack',
        },
      })
    ).rejects.toThrow("'error' must be an Error instance.")
  })

  describe('hermes: safe vs dangerous', () => {
    let client: ReturnType<typeof createSentryClient>
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

      expect(fetchMock.mock.calls[0][0]).toEqual(
        new URL('api/projectId/envelope/', fullTestConfig.dsnUrl)
      )
      const { header, itemHeader, payload } = parseEnvelope(fetchMock.mock.calls[0][1].body)
      expect(header.event_id).toEqual(payload.event_id)
      expect(itemHeader).toEqual(EVENT_ITEM_HEADER)
      expectNumbers(payload).toMatchSnapshot()
    })
  })
})
