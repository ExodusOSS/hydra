import type { Storage } from '@exodus/storage-interface'
import { StorageMobile } from './storage.js'
import type { Dependencies } from './helpers/types'

export default function createStorageMobile<Value>({ asyncStorage }: Dependencies): Storage<Value> {
  return new StorageMobile<Value>(asyncStorage)
}
