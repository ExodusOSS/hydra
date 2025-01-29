import runStorageSpecTestSuite from '@exodus/storage-spec'
import asMock from '@react-native-async-storage/async-storage/jest/async-storage-mock'

import createStorageMobile from '../src/index.ios.js'

describe('storage-mobile', () => {
  beforeEach(async () => {
    await asMock.clear()
  })

  runStorageSpecTestSuite({ factory: () => createStorageMobile({ asyncStorage: asMock }) })
})
