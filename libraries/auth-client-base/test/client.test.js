jest.mock('@exodus/fetch', () => ({
  fetch: jest.fn(),
}))

const { createClient, Client } = require('../')
const { fetch } = require('@exodus/fetch')

const unauthorizedError = new Error('Unauthorized - failed signature validation')
unauthorizedError.response = { status: 401 }

const keyPair = { privateKey: 'privateKey', publicKey: 'publicKey', sign: () => {} }
const config = {
  // doesn't matter
  keyPair,
  baseUrl: 'http://localhost:3001',
  authChallengeUrl: 'http://localhost:3001/auth/challenge',
  authTokenUrl: 'http://localhost:3001/auth/token',
}

describe('Client', () => {
  let client
  let fakeAuthenticateSpy

  beforeEach(() => {
    // Replace `Client.prototype._authenticate` to prevent authentication in constructor.
    fakeAuthenticateSpy = jest
      .spyOn(Client.prototype, '_authenticate')
      .mockImplementation(jest.fn().mockImplementation(async () => {}))

    client = createClient({ config })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should start authenticating when instantiated', () => {
    expect(fakeAuthenticateSpy).toHaveBeenCalledTimes(1)
  })

  // test('should not wait for authentication when fetching unauthenticated endpoint')

  // test('should wait for authentication when fetching authenticated endpoint')

  // test('should include token in headers when fetching authenticated endpoint')

  // test('should not include token in headers when fetching unauthenticated endpoint')

  test('should re-authenticate if token is bad when fetching', async () => {
    client._request = async () => {
      throw unauthorizedError
    }
    client._authenticate = async () => {
      client._request = () => Promise.resolve()
    }

    const spy = jest.spyOn(client, '_authenticate')

    await client.post('private', { auth: true })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('should only try to re-authenticate twice', async () => {
    const fetch = async () => ({
      status: 401,
      statusText: 'Unauthorized',
      json: () => ({ message: 'failed signature validation' }),
    })
    client = createClient({ fetch, config })

    client._authenticate = jest.fn()

    try {
      await client.post('private', { auth: true })
      throw new Error('should not get here')
    } catch (err) {
      expect(err.message).toEqual('401 Unauthorized - failed signature validation')
    }

    expect(client._authenticate).toHaveBeenCalledTimes(2)
  })

  test('should support paths and endpoints in fetch', async () => {
    const inputs = ['path/a', 'https://example.com/path/a']

    const expectedOutputs = [
      //
      `${config.baseUrl}/${inputs[0]}`,
      inputs[1],
    ]

    inputs.forEach((input, i) => {
      const output = client._buildUrl({ endpoint: input })
      expect(output).toEqual(expectedOutputs[i])
    })
  })

  test('should re-auth on next req after failing initial auth', async () => {
    const someErr = new Error('some error')
    client._authPromise = Promise.reject(someErr)
    client._authenticate = jest.fn().mockImplementation(async () => {
      throw someErr
    })

    const awaitAuthSpy = jest.spyOn(client, '_awaitAuthenticated')

    try {
      await client.post('private', { auth: true })
    } catch (err) {
      expect(err.message).toEqual(someErr.message)
    }

    expect(client._awaitAuthenticated).toHaveBeenCalledTimes(1)
    // via _awaitAuthenticated()
    expect(awaitAuthSpy).toHaveBeenCalledTimes(1)
  })

  describe('additional headers', () => {
    beforeEach(() => {
      jest.spyOn(client, '_awaitAuthenticated').mockReturnValue(Promise.resolve())
      client._token = 'My token'

      fetch.mockReturnValue({ json: () => ({}), ok: true })
    })

    test('should pass additional headers through to fetch', async () => {
      const headers = {
        Cookie: 'adding my own cookies',
        Accept: 'application/signed-exchange',
      }

      await client.post('https://wayne-foundation.com/submit', { auth: true, headers })

      expect(fetch).toHaveBeenCalledWith(
        'https://wayne-foundation.com/submit',
        expect.objectContaining({
          headers: expect.objectContaining({
            ...headers,
            Authorization: `Bearer My token`,
          }),
        })
      )
    })

    test('should prevent overriding the Authorization header', async () => {
      const headers = {
        Authorization: 'purge auth token',
      }

      await client.post('https://wayne-foundation.com/submit', { auth: true, headers })

      expect(fetch).toHaveBeenCalledWith(
        'https://wayne-foundation.com/submit',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer My token`,
          }),
        })
      )
    })
  })

  test('error contains statusCode and url if message and statusText are empty', async () => {
    const fetch = async () => ({
      status: 400,
      statusText: undefined,
      url: 'http://localhost/error',
      json: () => ({}),
    })
    client = createClient({ fetch, config })
    client._authenticate = jest.fn()

    await expect(client.post('/error')).rejects.toThrow('400 http://localhost/error')
  })
})

it('does not authenticate without keypair', () => {
  expect(() => createClient({ fetch, config: { ...config, keyPair: undefined } })).not.toThrow()
})
