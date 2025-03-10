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
  })

  test('validate domains and subdomains on setHeaders', async () => {
    const fetchFactory = new FetchFactory(fetchFn)

    expect(() => {
      fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['invalid_domain'])
    }).toThrow('Invalid domain: invalid_domain')

    const invalidDomainHeadersResult = await fetchFactory.create()('https://invalid_domain')
    expect(invalidDomainHeadersResult).toEqual({})

    expect(() => {
      fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['example..com'])
    }).toThrow('Invalid domain: example..com')

    const invalidDomainHeadersResult2 = await fetchFactory.create()('https://example..com')
    expect(invalidDomainHeadersResult2).toEqual({})

    expect(() => {
      fetchFactory.setHeaders({ 'x-custom-header': 'custom-value' }, ['-example.com'])
    }).toThrow('Invalid domain: -example.com')

    const invalidDomainHeadersResult3 = await fetchFactory.create()('https://-example.com')
    expect(invalidDomainHeadersResult3).toEqual({})
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
})
