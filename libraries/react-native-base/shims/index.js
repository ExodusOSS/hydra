import { randomUUID } from '@exodus/crypto/randomUUID'
import { HttpClient } from '@exodus/networking-mobile/http'
import URL from '@exodus/networking-mobile/url/url'
import URLSearchParams from '@exodus/networking-mobile/url/url-search-params'
import RNFS from '@exodus/react-native-fs'
import { Platform } from 'react-native'

import { allSettled } from './promises.js'
import { readAsArrayBuffer } from './file-reader.js'
import '@exodus/dayjs'

export default function createShims({ isDev }) {
  if (typeof __dirname === 'undefined') global.__dirname = '/'
  if (typeof __filename === 'undefined') global.__filename = ''
  if (typeof process === 'undefined') {
    global.process = require('process')
  } else {
    const requiredProcess = require('process')
    for (const p in requiredProcess) {
      if (!(p in process)) {
        process[p] = requiredProcess[p]
      }
    }
  }

  global.self = global // fix "Can't find variable: self" error

  if (typeof globalThis === 'undefined') global.globalThis = global
  process.browser = false

  const client = new HttpClient(RNFS, Platform.OS, randomUUID, global.fetch)
  global.fetch = client.fetch.bind(client)

  if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

  // eslint-disable-next-line no-extra-boolean-cast
  if (!!global.HermesInternal) {
    require('@exodus/patch-broken-hermes-typed-arrays')
  }

  Object.assign(process.env, { NODE_ENV: isDev ? 'development' : 'production' }) // Fix after adding `transform-inline-environment-variables`

  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: () => {
        return null
      },
      setItem: () => {},
      removeItem: () => {},
    }
  } else {
    global.localStorage.debug = isDev ? '*' : ''
  }

  if (!global.Intl) {
    require('./intl')
  }

  if (!Object.fromEntries) {
    Object.defineProperty(Object, 'fromEntries', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: require('./from-entries').default,
    })
  }

  // firebase needs these base64 methods for Blob support
  if (!window.atob) {
    window.atob = function (encoded) {
      return Buffer.from(encoded, 'base64').toString('binary')
    }
  }

  if (!window.btoa) {
    window.btoa = function (raw) {
      const string = String(raw)
      if (/[^\0-\xFF]/u.test(string)) {
        throw new Error(
          'btoa: The string to be encoded contains characters outside of the Latin1 range.'
        )
      }

      return Buffer.from(string, 'binary').toString('base64')
    }
  }

  // firebase 6.0.4 fails if window.addEventListener is not a function
  if (!window.addEventListener) {
    Object.defineProperty(window, 'addEventListener', {
      get() {
        return () => {}
      },
    })
  }

  // Shim for Exodus Shares binary requests. readAsArrayBuffer is unimplemented on RN
  if (global.__DEV__ && global.__REACT_DEVTOOLS_PORT__ !== undefined) {
    // React Native Debugger blob support
    global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest
    global.Blob = global.originalBlob || global.Blob
    global.FileReader = global.originalFileReader || global.FileReader
  } else {
    FileReader.prototype.readAsArrayBuffer = readAsArrayBuffer
  }

  if (typeof Promise.allSettled !== 'function') {
    Promise.allSettled = allSettled
  }

  global.URL = URL
  global.URLSearchParams = URLSearchParams

  require('react-native-get-random-values')
}
