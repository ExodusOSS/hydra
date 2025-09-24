import { FetchFactory } from '../src/index.js'

const mockFetch = jest.fn()

describe('FetchFactory - Request Object Support', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({ ok: true })
  })

  test('handles Request objects with basic properties', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const request = new Request('https://example.com/api', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'Content-Type': 'application/json',
        'X-Custom': 'header-value',
      },
    })

    await fetch(request)

    expect(mockFetch).toHaveBeenCalledWith(expect.any(Request))

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.url).toBe('https://example.com/api')
    expect(passedRequest.method).toBe('POST')
    expect(passedRequest.headers.get('content-type')).toBe('application/json')
    expect(passedRequest.headers.get('x-custom')).toBe('header-value')
  })

  test('handles Request objects with all properties', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const controller = new AbortController()
    const request = new Request('https://example.com/api', {
      method: 'PUT',
      body: 'test body',
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      referrer: 'https://referrer.com',
      referrerPolicy: 'same-origin',
      integrity: 'sha256-abc123',
      signal: controller.signal,
      keepalive: true,
      duplex: 'half',
    })

    await fetch(request)

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.url).toBe('https://example.com/api')
    expect(passedRequest.method).toBe('PUT')
    expect(passedRequest.mode).toBe('cors')
    expect(passedRequest.credentials).toBe('include')
    expect(passedRequest.cache).toBe('no-cache')
    expect(passedRequest.redirect).toBe('follow')
    expect(passedRequest.referrer).toBe('about:client')
    expect(passedRequest.referrerPolicy).toBe('')
    expect(passedRequest.integrity).toBe('sha256-abc123')
    expect(passedRequest.signal).toBeInstanceOf(AbortSignal)
    expect(passedRequest.keepalive).toBe(true)
    expect(passedRequest.duplex).toBe('half')
  })

  test('allows options to override Request properties', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const request = new Request('https://example.com/api', {
      method: 'POST',
      headers: { 'X-Original': 'value1' },
    })

    await fetch(request, {
      method: 'PUT',
      headers: { 'X-Override': 'value2' },
    })

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.url).toBe('https://example.com/api')
    expect(passedRequest.method).toBe('PUT')
    expect(passedRequest.headers.get('x-original')).toBe('value1')
    expect(passedRequest.headers.get('x-override')).toBe('value2')
  })

  test('options headers take precedence over Request headers', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const request = new Request('https://example.com/api', {
      method: 'GET',
      headers: {
        'X-Custom': 'original-value',
        'Content-Type': 'text/plain',
        Authorization: 'Bearer old-token',
      },
    })

    await fetch(request, {
      headers: {
        'X-Custom': 'overridden-value',
        Authorization: 'Bearer new-token',
      },
    })

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.headers.get('x-custom')).toBe('overridden-value')
    expect(passedRequest.headers.get('authorization')).toBe('Bearer new-token')
    expect(passedRequest.headers.get('content-type')).toBe('text/plain')
  })

  test('handles URL objects', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const url = new URL('https://example.com/api?param=value')
    await fetch(url, { method: 'GET' })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api?param=value',
      expect.objectContaining({ method: 'GET' })
    )
  })

  test('adds domain-specific headers to Request objects', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    fetchFactory.setHeaders({ 'X-API-Key': 'secret' }, ['example.com'])

    const fetch = fetchFactory.create()
    const request = new Request('https://example.com/api', {
      method: 'GET',
      headers: { 'X-Request': 'value' },
    })

    await fetch(request)

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.headers.get('x-api-key')).toBe('secret')
    expect(passedRequest.headers.get('x-request')).toBe('value')
  })

  test('does not add domain-specific headers to Request objects for other domains', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    fetchFactory.setHeaders({ 'X-API-Key': 'secret', 'X-Private': 'token' }, ['example.com'])

    const fetch = fetchFactory.create()
    const request = new Request('https://other-domain.com/api', {
      method: 'GET',
      headers: { 'X-Request': 'value' },
    })

    await fetch(request)

    const [passedRequest] = mockFetch.mock.calls[0]
    expect(passedRequest).toBeInstanceOf(Request)
    expect(passedRequest.headers.get('x-api-key')).toBeNull()
    expect(passedRequest.headers.get('x-private')).toBeNull()
    expect(passedRequest.headers.get('x-request')).toBe('value')
  })

  test('handles Request without headers', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const request = new Request('https://example.com/api')
    await fetch(request)

    expect(mockFetch).toHaveBeenCalledWith(expect.any(Request))
  })

  test('preserves extra arguments passed to fetch', async () => {
    const fetchFactory = new FetchFactory(mockFetch)
    const fetch = fetchFactory.create()

    const request = new Request('https://example.com/api')
    const extra1 = { custom: 'arg1' }
    const extra2 = 'arg2'

    await fetch(request, {}, extra1, extra2)

    expect(mockFetch).toHaveBeenCalledWith(expect.any(Request), extra1, extra2)
  })
})
