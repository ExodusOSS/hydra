import createStorageMobile from '../src/index.ios'
import asMock from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import runStorageSpecTestSuite from '@exodus/storage-spec'

describe('storage-mobile', () => {
  beforeEach(async () => {
    await asMock.clear()
  })

  runStorageSpecTestSuite({ factory: () => createStorageMobile({ asyncStorage: asMock }) })
})
