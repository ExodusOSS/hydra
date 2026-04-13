import {
  WHITELISTED_HEADERS,
  WHITELISTED_X_AUTH_HEADERS,
  EXODUS_HOST,
  GLOBAL_HOST,
} from './constants.js'

import { getUrlHostname, isValidHostname } from './hostname.js'

const omitNullish = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null))

export class FetchFactory {
  constructor(fetchFn) {
    if (!fetchFn) {
      throw new Error('fetchFn is required')
    }

    this.fetchFn = fetchFn
    this.headerConfigs = {
      [GLOBAL_HOST]: Object.create(null),
    }
  }

  setHeaders(headers, allowedHostnames = [GLOBAL_HOST]) {
    for (const hostname of allowedHostnames) {
      if (hostname === GLOBAL_HOST) {
        const allowedHeaders = []
        const bannedHeaders = []

        for (const key of Object.keys(headers)) {
          const lowerCaseKey = key.toLowerCase()
          const isInWhitelist = WHITELISTED_HEADERS.has(lowerCaseKey)
          const isValidXHeader =
            lowerCaseKey.startsWith('x-') && !WHITELISTED_X_AUTH_HEADERS.has(lowerCaseKey)

          if (!isInWhitelist && !isValidXHeader) {
            bannedHeaders.push(key)
            continue
          }

          allowedHeaders.push(key)
        }

        if (bannedHeaders.length > 0) {
          throw new Error(
            `The following headers are not whitelisted to be used as default: ${bannedHeaders.join(
              ', '
            )}`
          )
        }

        for (const key of allowedHeaders) {
          if (headers[key] == null) {
            delete this.headerConfigs[GLOBAL_HOST][key]
          } else {
            this.headerConfigs[GLOBAL_HOST][key] = headers[key]
          }
        }

        continue
      }

      if (!isValidHostname(hostname)) {
        throw new Error(`Not a domain or IPv4 address: ${hostname}`)
      }

      if (!this.headerConfigs[hostname]) {
        this.headerConfigs[hostname] = Object.create(null)
      }

      this.headerConfigs[hostname] = omitNullish({ ...this.headerConfigs[hostname], ...headers })
    }

    return this
  }

  setDefaultExodusIdentifierHeaders({ appId, appVersion, appBuild }) {
    if (!this.headerConfigs[EXODUS_HOST]) {
      this.headerConfigs[EXODUS_HOST] = Object.create(null)
    }

    this.headerConfigs[EXODUS_HOST] = {
      ...this.headerConfigs[EXODUS_HOST],
      'x-exodus-app-id': appId,
      'x-exodus-version': appVersion,
      'x-requested-with': `${appId} ${appVersion} ${appBuild}`,
    }

    return this
  }

  #buildHeaders(url, existingHeaders) {
    const headers = new Headers(Object.create(null))

    Object.entries(this.headerConfigs[GLOBAL_HOST]).forEach(([key, value]) => {
      headers.set(key, value)
    })

    const hostname = getUrlHostname(url)
    if (hostname) {
      const matchedDomain = Object.keys(this.headerConfigs).find((key) => {
        return hostname === key || hostname.endsWith(`.${key}`)
      })

      if (matchedDomain) {
        Object.entries(this.headerConfigs[matchedDomain]).forEach(([key, value]) => {
          headers.set(key, value)
        })
      }
    }

    if (existingHeaders) {
      new Headers(existingHeaders).forEach((value, key) => {
        headers.set(key, value)
      })
    }

    return headers
  }

  create() {
    return (urlOrRequest, opts = {}, ...args) => {
      if (urlOrRequest instanceof Request) {
        const headers = this.#buildHeaders(urlOrRequest.url)

        urlOrRequest.headers.forEach((value, key) => {
          headers.set(key, value)
        })

        if (opts.headers) {
          new Headers(opts.headers).forEach((value, key) => {
            headers.set(key, value)
          })
        }

        const newRequest = new Request(urlOrRequest, { ...opts, headers })
        return this.fetchFn(newRequest, ...args)
      }

      let url
      if (urlOrRequest instanceof URL) {
        url = urlOrRequest.href
      } else {
        url = urlOrRequest
      }

      const headers = this.#buildHeaders(url, opts.headers)
      const options = { ...opts, headers }

      return this.fetchFn(url, options, ...args)
    }
  }
}
