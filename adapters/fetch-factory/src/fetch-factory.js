import {
  WHITELISTED_HEADERS,
  WHITELISTED_X_AUTH_HEADERS,
  EXODUS_HOST,
  GLOBAL_HOST,
} from './constants.js'

import { getUrlHostname, isValidDomain } from './validate-domain.js'

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

  setHeaders(headers, allowedHostDomains = [GLOBAL_HOST]) {
    for (const domain of allowedHostDomains) {
      if (domain === GLOBAL_HOST) {
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

      if (!isValidDomain(domain)) {
        throw new Error(`Invalid domain: ${domain}`)
      }

      if (!this.headerConfigs[domain]) {
        this.headerConfigs[domain] = Object.create(null)
      }

      this.headerConfigs[domain] = omitNullish({ ...this.headerConfigs[domain], ...headers })
    }

    return this
  }

  setDefaultExodusIdentifierHeaders({ appId, appVersion, appBuild }) {
    if (!this.headerConfigs[EXODUS_HOST]) {
      this.headerConfigs[EXODUS_HOST] = Object.create(null)
    }

    this.headerConfigs[EXODUS_HOST] = {
      'x-exodus-app-id': appId,
      'x-exodus-version': appVersion,
      'x-requested-with': `${appId} ${appVersion} ${appBuild}`,
    }

    return this
  }

  create() {
    return (urlOrPath, opts = {}, ...args) => {
      const headers = new Headers(Object.create(null))

      // Add headers for the global host
      Object.entries(this.headerConfigs[GLOBAL_HOST]).forEach(([key, value]) => {
        headers.set(key, value)
      })

      const hostname = getUrlHostname(urlOrPath)
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

      new Headers(opts.headers ?? Object.create(null)).forEach((value, key) => {
        headers.set(key, value)
      })

      opts = { ...opts, headers }

      return this.fetchFn(urlOrPath, opts, ...args)
    }
  }
}
