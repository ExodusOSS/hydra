import assert from 'minimalistic-assert'
import BJSON from 'buffer-json'

import * as seco from './seco'

const encoding = 'base64'

const createSecoStorage = ({ prefix = '', storage, appVersion } = {}) => {
  assert(appVersion && typeof appVersion === 'string', 'appVersion must be a string')

  const _get = async (key, opts = {}) => {
    const { passphrase } = opts

    const data = await storage.get(key)

    if (!passphrase) return data

    if (data === undefined) return

    const string = await seco.decryptString({
      data,
      key: passphrase,
      encoding,
    })

    return BJSON.parse(string)
  }

  const _set = async (key, value, opts = {}) => {
    const { passphrase } = opts

    if (!passphrase) return storage.set(key, value)

    let data = BJSON.stringify(value)

    data = await seco.encryptString({
      data,
      key: passphrase,
      encoding,
      appVersion,
    })

    return storage.set(key, data)
  }

  return {
    ...storage,
    get: _get,
    set: async (key, value, opts) => {
      if (value === undefined) throw new Error(`cannot set ${key} to undefined`)

      await _set(key, value, opts)
    },
    batchGet: async (keys, opts = {}) => {
      return Promise.all(keys.map(async (key) => _get(key, opts)))
    },
    batchSet: async (obj, opts = {}) => {
      for (const key in obj) {
        if (obj[key] === undefined) throw new Error(`cannot set ${key} to undefined`)
      }

      const entries = Object.entries(obj)

      await Promise.all(entries.map(async ([key, value]) => _set(key, value, opts)))
    },
    namespace: (newPrefix) => {
      return createSecoStorage({
        prefix: `${prefix}!${newPrefix}!`,
        storage: storage.namespace(newPrefix),
        appVersion,
      })
    },
  }
}

export default createSecoStorage
