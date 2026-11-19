import { FetchFactory, hosts } from '../src/index.js'

const fetchFn = async (url, opts = {}, ...args) => {
  const headers = {}
  opts.headers.forEach((value, key) => {
    headers[key] = value
  })
  return Object.fromEntries(opts.headers)
}

describe('FetchFactory', () => {
  test('global domain headers', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    expect(() => {
      fetchFactory.setHeaders({
        'x-api-key': 'my-key',
        'x-custom-header': 'custom-value',
        'any-header': 'some token',
      })
    }).toThrow(
      'The following headers are not whitelisted to be used as default: x-api-key, any-header'
    )

    fetchFactory.setHeaders({ 'User-Agent': 'custom-agent' })

    const globalHeadersResult = await fetchFactory.create()('https://example.com')

    expect(globalHeadersResult).toEqual({
      'user-agent': 'custom-agent',
    })

    fetchFactory.setHeaders({ 'User-Agent': undefined })

    const globalHeadersResult2 = await fetchFactory.create()('https://example.com')

    expect(globalHeadersResult2).toEqual({})
  })

  test('setDefaultExodusIdentifierHeaders should set exodus headers and not override existing headers', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, [hosts.EXODUS_HOST])

    fetchFactory.setDefaultExodusIdentifierHeaders({
      appId: 'custom-id',
      appVersion: '0.0.1',
      appBuild: 'custom-build',
    })

    const exodusHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(exodusHeadersResult).toEqual({
      'x-custom-header': 'custom-value',
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
    })
  })

  test('set exodus headers', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    const emptyExodusHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(emptyExodusHeadersResult).toEqual({})

    fetchFactory.setDefaultExodusIdentifierHeaders({
      appId: 'custom-id',
      appVersion: '0.0.1',
      appBuild: 'custom-build',
    })

    const defaultExodusHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(defaultExodusHeadersResult).toEqual({
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
    })

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, [hosts.EXODUS_HOST])

    const defaultExodusHeadersWithCustomResult = await fetchFactory.create()('https://exodus.io', {
      headers: {
        'x-custom-header2': 'custom-value',
      },
    })

    expect(defaultExodusHeadersWithCustomResult).toEqual({
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
      'x-custom-header': 'custom-value',
      'x-custom-header2': 'custom-value',
    })

    const exodusSubdomainHeadersResult = await fetchFactory.create()('https://geth.exodus.io')

    expect(exodusSubdomainHeadersResult).toEqual({
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
      'x-custom-header': 'custom-value',
    })

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['exodus.com'])

    const differentHostHeaderResult = await fetchFactory.create()('https://exodus.com', {
      headers: new Headers({
        'x-custom-header2': 'custom-value',
      }),
    })

    expect(differentHostHeaderResult).toEqual({
      'x-custom-header': 'custom-value',
      'x-custom-header2': 'custom-value',
    })

    const pathRequestResult = await fetchFactory.create()('/some-path', {
      headers: new Headers({
        'x-custom-header3': 'custom-value',
      }),
    })

    expect(pathRequestResult).toEqual({
      'x-custom-header3': 'custom-value',
    })

    fetchFactory.setHeaders({ 'x-custom-header3': undefined })

    const pathRequestResult2 = await fetchFactory.create()('/some-path', {
      headers: new Headers({}),
    })

    expect(pathRequestResult2).toEqual({})
  })

  test('setDefaultExodusIdentifierHeaders sets identifier headers for exodus-int.com', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setDefaultExodusIdentifierHeaders({
      appId: 'custom-id',
      appVersion: '0.0.1',
      appBuild: 'custom-build',
    })

    const identifierHeaders = {
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
    }

    expect(await fetchFactory.create()('https://exodus-int.com')).toEqual(identifierHeaders)
    expect(await fetchFactory.create()('https://a.exodus-int.com/path')).toEqual(identifierHeaders)
    expect(await fetchFactory.create()('https://exodus.io')).toEqual(identifierHeaders)
    expect(await fetchFactory.create()('https://exodus-int.com.evil.com')).toEqual({})
    expect(await fetchFactory.create()('https://notexodus-int.com')).toEqual({})

    const overrideResult = await fetchFactory.create()('https://a.exodus-int.com', {
      headers: { 'x-exodus-version': '9.9.9' },
    })

    expect(overrideResult).toEqual({ ...identifierHeaders, 'x-exodus-version': '9.9.9' })
  })

  test('host-specific headers do not leak between exodus.io and exodus-int.com', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-exodus-only': 'exodus' }, [hosts.EXODUS_HOST])
    fetchFactory.setHeaders({ 'x-int-only': 'int' }, [hosts.EXODUS_INT_HOST])

    fetchFactory.setDefaultExodusIdentifierHeaders({
      appId: 'custom-id',
      appVersion: '0.0.1',
      appBuild: 'custom-build',
    })

    const identifierHeaders = {
      'x-exodus-app-id': 'custom-id',
      'x-exodus-version': '0.0.1',
      'x-requested-with': 'custom-id 0.0.1 custom-build',
    }

    expect(await fetchFactory.create()('https://exodus.io')).toEqual({
      ...identifierHeaders,
      'x-exodus-only': 'exodus',
    })
    expect(await fetchFactory.create()('https://a.exodus-int.com')).toEqual({
      ...identifierHeaders,
      'x-int-only': 'int',
    })
  })

  test('keys that cannot equal a parsed URL hostname never attach headers', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['https://exodus.io'])

    const result = await fetchFactory.create()('https://exodus.io/resource')
    expect(result).toEqual({})
  })

  test('matches single-label hostnames verbatim', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['internal-host'])

    const result = await fetchFactory.create()('https://internal-host/resource')
    expect(result).toEqual({ 'x-custom-header': 'custom-value' })
  })

  test('validate headers with different URL structures', async () => {
    const fetchFactory = new FetchFactory(fetchFn)
    fetchFactory.setHeaders({ 'x-global-header': 'global-value' })
    fetchFactory.setHeaders({ 'x-specific-header': 'specific-value' }, [hosts.EXODUS_HOST])

    const headersResult1 = await fetchFactory.create()(
      'https://exodus.io/some/path/to/resource?index=100&some_flag'
    )
    expect(headersResult1).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })

    const headersResult2 = await fetchFactory.create()('https://exodus.io/')
    expect(headersResult2).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })

    const headersResult3 = await fetchFactory.create()('https://exodus.io?filter_stuff=10')
    expect(headersResult3).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })

    const headersResult4 = await fetchFactory.create()('http://exodus.io')
    expect(headersResult4).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })

    const headersResult5 = await fetchFactory.create()('http://exodus.io:1337')
    expect(headersResult5).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })
  })

  test('set global vs specific headers', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-global-header': 'global-value' })

    const globalHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(globalHeadersResult).toEqual({
      'x-global-header': 'global-value',
    })

    fetchFactory.setHeaders({ 'x-specific-header': 'specific-value' }, [hosts.EXODUS_HOST])

    const specificHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(specificHeadersResult).toEqual({
      'x-global-header': 'global-value',
      'x-specific-header': 'specific-value',
    })
  })

  test('set headers for multiple domains', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, [
      hosts.EXODUS_HOST,
      'example.com',
    ])

    const exodusHeadersResult = await fetchFactory.create()('https://exodus.io')

    expect(exodusHeadersResult).toEqual({
      'x-custom-header': 'custom-value',
    })

    const exampleHeadersResult = await fetchFactory.create()('https://example.com')

    expect(exampleHeadersResult).toEqual({
      'x-custom-header': 'custom-value',
    })
  })

  test('set headers with Headers object', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, [hosts.EXODUS_HOST])

    const exodusHeadersResult = await fetchFactory.create()('https://exodus.io', {
      headers: new Headers({ 'x-custom-header2': 'custom-value' }),
    })

    expect(exodusHeadersResult).toEqual({
      'x-custom-header': 'custom-value',
      'x-custom-header2': 'custom-value',
    })
  })

  test('set hostname-specific headers when initializing with URL objects', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-specific-header': 'specific-value' }, [hosts.EXODUS_HOST])

    const specificHeadersResult = await fetchFactory.create()(new URL('https://exodus.io'))

    expect(specificHeadersResult).toEqual({
      'x-specific-header': 'specific-value',
    })
  })

  test('set hostname-specific headers for localhost', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['localhost'])

    const localhost = await fetchFactory.create()('http://localhost')
    const localhostWithPort = await fetchFactory.create()('http://localhost:3000')
    const localhostHttps = await fetchFactory.create()('https://localhost:3000')

    expect(localhost).toEqual({
      'x-custom-header': 'custom-value',
    })

    expect(localhostWithPort).toEqual({
      'x-custom-header': 'custom-value',
    })

    expect(localhostHttps).toEqual({
      'x-custom-header': 'custom-value',
    })
  })

  test('does not leak host-specific headers to a spoofed userinfo host', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, [hosts.EXODUS_HOST])

    const legitResult = await fetchFactory.create()('https://exodus.io/resource')
    expect(legitResult).toEqual({ 'x-custom-header': 'custom-value' })

    const portTrickResult = await fetchFactory.create()('https://exodus.io:x@evil.com/resource')
    expect(portTrickResult).toEqual({})

    const userinfoTrickResult = await fetchFactory.create()('https://exodus.io@evil.com/resource')
    expect(userinfoTrickResult).toEqual({})
  })

  test('hostnames colliding with Object.prototype keys are plain keys', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-proto-header': 'proto-value' }, ['__proto__'])
    fetchFactory.setHeaders({ 'x-ctor-header': 'ctor-value' }, ['constructor'])

    expect(Object.getPrototypeOf(fetchFactory.headerConfigs)).toBe(null)

    expect(await fetchFactory.create()('http://__proto__/')).toEqual({
      'x-proto-header': 'proto-value',
    })
    expect(await fetchFactory.create()('http://constructor/')).toEqual({
      'x-ctor-header': 'ctor-value',
    })
    expect(await fetchFactory.create()('https://exodus.io')).toEqual({})
  })

  test('header config maps never gain Object.prototype', () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['example.com'])
    fetchFactory.setDefaultExodusIdentifierHeaders({
      appId: 'custom-id',
      appVersion: '0.0.1',
      appBuild: 'custom-build',
    })

    expect(Object.getPrototypeOf(fetchFactory.headerConfigs)).toBe(null)
    for (const config of Object.values(fetchFactory.headerConfigs)) {
      expect(Object.getPrototypeOf(config)).toBe(null)
    }
  })

  test('set hostname-specific headers for IPv4 addresses', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    fetchFactory.setHeaders({ 'x-ipv4-header': 'v4' }, ['127.0.0.1'])

    const ipv4NoPort = await fetchFactory.create()('http://127.0.0.1')
    const ipv4WithPort = await fetchFactory.create()('http://127.0.0.1:3000')

    expect(ipv4NoPort).toEqual({ 'x-ipv4-header': 'v4' })
    expect(ipv4WithPort).toEqual({ 'x-ipv4-header': 'v4' })
  })
})
