import suite from '@exodus/storage-spec'

import MemoryStore from '../../__tests__/memory-store'
import createStorage from '../../unsafe-storage'
import createSeedStorage from '../index'

describe('seed-storage', () => {
  const passphrase = 'my-password-manager-generated-this'
  const appVersion = '1.2.3'

  describe('without passphrase', () => {
    const factory = () => {
      const unsafeStorage = createStorage({ store: new MemoryStore() })
      return createSeedStorage({ storage: unsafeStorage, appVersion })
    }

    suite({ factory })
  })

  describe('with passphrase', () => {
    const factory = () => {
      const unsafeStorage = createStorage({ store: new MemoryStore() })
      const seedStorage = createSeedStorage({ storage: unsafeStorage, appVersion })
      const withPassphrase =
        (fn) =>
        (...args) =>
          fn(...args, { passphrase })

      return {
        ...seedStorage,
        get: withPassphrase(seedStorage.get),
        set: withPassphrase(seedStorage.set),
        batchGet: withPassphrase(seedStorage.batchGet),
        batchSet: withPassphrase(seedStorage.batchSet),
      }
    }

    suite({ factory })
  })

  describe('encryption', () => {
    test('should encrypt values on underlying storage', async () => {
      const unsafeStorage = createStorage({ store: new MemoryStore() })
      const seedStorage = createSeedStorage({ storage: unsafeStorage, appVersion })
      const mnemonic = 'feri rec andrej mark jan alexes egor oli sarunas filip greg ryan'

      await seedStorage.set('mnemonic', mnemonic, { passphrase })

      const storedValue = await unsafeStorage.get('mnemonic')

      expect(storedValue).not.toBe(mnemonic)
    })
  })
})
