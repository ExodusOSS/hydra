declare module '@exodus/storage-memory' {
  import { Storage } from '@exodus/storage-interface'

  export default function createInMemoryStorage<Value>(): Storage<Value>
}
