import createInMemoryStorage from '@exodus/storage-memory'
import BJSON from 'buffer-json'
import assert from 'minimalistic-assert'

const encoding = 'base64'
const normalizePassphrase = (passphrase) =>
  Buffer.isBuffer(passphrase) ? passphrase.toString('hex') : passphrase

const createSeedStorage = ({ prefix = '', storage = createInMemoryStorage() } = {}) => {
  return {
    ...storage,
    get: async (key, opts = {}) => {
      let { passphrase } = opts

      const data = await storage.get(key)

      if (!passphrase) return data
      if (!data) return data

      passphrase = normalizePassphrase(passphrase)
      const string = Buffer.from(data, encoding).toString()
      assert(string.startsWith(passphrase), 'fake decryption failed')
      return BJSON.parse(string.slice(passphrase.length))
    },
    set: async (key, value, opts = {}) => {
      let { passphrase } = opts

      if (!passphrase) return storage.set(key, value)

      passphrase = normalizePassphrase(passphrase)
      const data = Buffer.from(`${passphrase}${BJSON.stringify(value)}`).toString(encoding)

      return storage.set(key, data)
    },
    namespace: (newPrefix) => {
      return createSeedStorage({
        prefix: `${prefix}!${newPrefix}!`,
        storage: storage.namespace(newPrefix),
      })
    },
  }
}

export default createSeedStorage
