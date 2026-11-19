import runStorageSpecTestSuite from '@exodus/storage-spec'
import asMock from '@react-native-async-storage/async-storage/jest/async-storage-mock'

import createStorageMobile from '../src/index.ios.js'

describe('storage-mobile', () => {
  beforeEach(async () => {
    await asMock.clear()
  })

  runStorageSpecTestSuite({ factory: () => createStorageMobile({ asyncStorage: asMock }) })

  describe('corrupt data handling', () => {
    it('returns undefined and tracks error for corrupt JSON values in batchGet', async () => {
      const errorTracking = { track: jest.fn() }
      const storage = createStorageMobile({ asyncStorage: asMock, errorTracking })

      // Directly inject invalid JSON into async storage to simulate corruption
      await asMock.setItem('validKey', JSON.stringify({ hello: 'world' }))
      await asMock.setItem('corruptKey', 'not valid json {{{')

      const [valid, corrupt] = await storage.batchGet(['validKey', 'corruptKey'])
      expect(valid).toEqual({ hello: 'world' })
      expect(corrupt).toBeUndefined()
      expect(errorTracking.track).toHaveBeenCalledTimes(1)
      expect(errorTracking.track).toHaveBeenCalledWith({ error: expect.any(SyntaxError) })
    })

    it('returns undefined and tracks error for corrupt JSON values in get', async () => {
      const errorTracking = { track: jest.fn() }
      const storage = createStorageMobile({ asyncStorage: asMock, errorTracking })

      await asMock.setItem('corruptKey', 'not valid json')

      const value = await storage.get('corruptKey')
      expect(value).toBeUndefined()
      expect(errorTracking.track).toHaveBeenCalledTimes(1)
      expect(errorTracking.track).toHaveBeenCalledWith({ error: expect.any(SyntaxError) })
    })

    it('tracks errors through namespaced storage', async () => {
      const errorTracking = { track: jest.fn() }
      const storage = createStorageMobile({ asyncStorage: asMock, errorTracking })
      const namespaced = storage.namespace('sub')

      await asMock.setItem('!sub!corruptKey', 'not valid json')

      const value = await namespaced.get('corruptKey')
      expect(value).toBeUndefined()
      expect(errorTracking.track).toHaveBeenCalledTimes(1)
    })

    it('does not require errorTracking', async () => {
      const storage = createStorageMobile({ asyncStorage: asMock })

      await asMock.setItem('corruptKey', 'not valid json')

      await expect(storage.get('corruptKey')).resolves.toBeUndefined()
    })
  })
})
