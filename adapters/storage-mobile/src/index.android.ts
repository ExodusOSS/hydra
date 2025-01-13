import { Storage } from '@exodus/storage-interface'
import { StorageMobile } from './storage'
import { Dependencies } from './helpers/types'
import withFilesystemFallback from './helpers/with-filesystem-fallback'
import { assertNonNullable } from './helpers/assertions'
import assert from 'minimalistic-assert'

export default function createStorageMobile<Value>({
  asyncStorage,
  androidFallback,
}: Dependencies): Storage<Value> {
  assertNonNullable(androidFallback, 'Fallback options have to be provided on Android')

  const { filesystem, hashString } = androidFallback

  assert(filesystem, 'expected "androidFallback.filesystem"')
  assert(typeof hashString === 'function', 'expected "androidFallback.hashString"')

  return withFilesystemFallback<Value>({
    ...androidFallback,
    storage: new StorageMobile<Value>(asyncStorage),
  })
}
