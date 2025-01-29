import type { Storage } from '@exodus/storage-interface'
import { StorageMobile } from './storage.js'
import type { Dependencies } from './helpers/types'
import withFilesystemFallback from './helpers/with-filesystem-fallback.js'
import { hashSync } from '@exodus/crypto/hash'
import fs from '@exodus/react-native-fs'
import assert from 'minimalistic-assert'

const hashString = (str: string) => hashSync('sha256', str, 'hex').slice(0, 20)

const defaultAndroidFallback = {
  filesystem: {
    rimraf: async (filepath: string) => {
      const exists = await fs.exists(filepath)
      if (!exists) {
        console.warn('rimraf tried to unlink an nonexistent file/dir', filepath)
        return
      }

      try {
        await fs.unlink(filepath)
      } catch {
        console.warn("rimraf tried to remove a file/folder that doesn't exist")
      }
    },
    mkdirp: fs.mkdir.bind(fs),
    readUtf8: (fs as any).readUtf8.bind(fs),
    writeUtf8: (fs as any).writeUtf8.bind(fs),
  },
  placeholder: '~',
  rootDir: fs.DocumentDirectoryPath + '/async-storage',
  hashString,
  threshold: 1.9 * 1024 * 1024, // 2 megs, slightly lower to avoid the edge cases too close to the limit
}

export default function createStorageMobile<Value>({
  asyncStorage,
  androidFallback,
}: Dependencies): Storage<Value> {
  if (androidFallback?.hashString) {
    assert(
      typeof androidFallback.hashString === 'function',
      'expected "androidFallback.hashString"'
    )
  }

  return withFilesystemFallback<Value>({
    ...defaultAndroidFallback,
    ...androidFallback,
    storage: new StorageMobile<Value>(asyncStorage),
  })
}
