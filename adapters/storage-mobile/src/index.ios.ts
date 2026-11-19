import type { Storage } from '@exodus/storage-interface'
import { StorageMobile } from './storage.js'
import type { Dependencies } from './helpers/types.js'

export default function createStorageMobile<Value>({
  asyncStorage,
  errorTracking,
}: Dependencies): Storage<Value> {
  return new StorageMobile<Value>(asyncStorage, '', errorTracking)
}
