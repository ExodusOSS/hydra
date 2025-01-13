const { get, pickBy } = require('lodash')
const { fetch: exodusFetch } = require('@exodus/fetch')
const typeforce = require('@exodus/typeforce')

const HTTP_METHODS = ['get', 'post', 'delete', 'put', 'patch']

const DEFAULT_CONFIG = {
  maxReauthAttempts: 2,
}

const urlJoin = (a, b) => a.replace(/\/+$/, '') + '/' + b.replace(/^\/+/, '')
const DEFAULT_AUTH_OPTION_VALUE = true

const getHeadersFromMetadata = (metadata) =>
  pickBy(
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-exodus-build': metadata.build,
      'x-exodus-version': metadata.version,
      'x-exodus-dev': metadata.dev,
      'x-exodus-os': metadata.platformName && metadata.platformName.toLowerCase(),
      'x-exodus-os-version': metadata.osVersion,
      'x-exodus-app-id': metadata.appId,
    },
    (value) => value != null
  )

class Client {
  constructor({ fetch = exodusFetch, config, metadata = {} }) {
    typeforce(
      {
        keyPair: typeforce.maybe(typeforce.Object),
        baseUrl: typeforce.String,
        authChallengeUrl: typeforce.String,
        authTokenUrl: typeforce.String,
        maxReauthAttempts: typeforce.maybe(typeforce.Number),
        serverId: typeforce.maybe(typeforce.String),
      },
      config
    )

    this._fetch = fetch
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    }

    this._defaultHeaders = getHeadersFromMetadata(metadata)
    this._authenticate().catch(() => {
      // will retry to auth on next request
      // console.log(`binauth authenticate failed for ${this._config.baseUrl}`, err)
    })

    HTTP_METHODS.forEach((method) => {
      this[method] = this._requestWithReauth.bind(this, method)
    })
  }

  get token() {
    return this._token
  }

  _buildUrl({ endpoint, query }) {
    const url = /^https?:\/\//.test(endpoint) ? endpoint : urlJoin(this._config.baseUrl, endpoint)
    return query ? url + `?${new URLSearchParams(query)}` : url
  }

  async _request(
    method,
    endpoint,
    { auth = DEFAULT_AUTH_OPTION_VALUE, data, query, headers: additionalHeaders }
  ) {
    const url = this._buildUrl({ endpoint, query })
    const headers = {
      ...this._defaultHeaders,
      ...additionalHeaders,
    }

    if (auth) {
      await this._awaitAuthenticated()
      headers.Authorization = `Bearer ${this._token}`
    }

    method = method.toUpperCase()
    const response = await this._fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const { status, statusText, url } = response
      let messages = [status, statusText, url]
      let details = {}
      try {
        details = await response.json()

        if (details.message) messages.push(`- ${details.message}`)
        if (details.errors) {
          const { title, detail = '' } = get(details, 'errors[0]') || {}
          if (title || detail) {
            messages.push(`${title}: ${detail}`)
          }
        }
      } catch (err) {}

      const err = new Error(messages.filter(Boolean).join(' '))
      err.response = response
      err.details = details
      throw err
    }

    return response.json()
  }

  // fetch, optionally with re-auth
  async _requestWithReauth(method, endpoint, options = {}, reauthAttempts = 0) {
    const { auth = DEFAULT_AUTH_OPTION_VALUE } = options
    if (!auth) {
      return this._request(method, endpoint, options)
    }

    try {
      return await this._request(method, endpoint, options)
    } catch (err) {
      const isAuthenticationError = get(err, 'response.status') === 401
      if (isAuthenticationError && reauthAttempts < this._config.maxReauthAttempts) {
        await this._authenticate()
        return this._requestWithReauth(method, endpoint, options, reauthAttempts + 1)
      }

      throw err
    }
  }

  _authenticate() {
    const { keyPair, authChallengeUrl, authTokenUrl, serverId } = this._config
    this._authPromise = (async () => {
      if (!keyPair) {
        return
      }
      const { challenge } = await this._request('POST', authChallengeUrl, {
        auth: false,
        data: {
          publicKey: keyPair.publicKey.toString('hex'),
        },
      })

      let encodedChallenge = Buffer.from(challenge, 'base64')

      if (serverId) {
        encodedChallenge = Buffer.concat([Buffer.from(serverId), encodedChallenge])
      }

      const signedChallenge = await keyPair.sign(encodedChallenge)
      const { token } = await this._request('POST', authTokenUrl, {
        auth: false,
        data: {
          publicKey: keyPair.publicKey.toString('hex'),
          signedChallenge: signedChallenge.toString('base64'),
        },
      })

      this._token = token
    })()

    return this._authPromise
  }

  async _awaitAuthenticated() {
    try {
      await this._authPromise
    } catch (err) {
      // retry if previous auth failed
      await this._authenticate()
    }
  }
}

module.exports = (opts) => new Client(opts)
module.exports.Client = Client
