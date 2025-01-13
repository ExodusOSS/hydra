declare module 'proxy-freeze'
declare module 'make-concurrent'
declare module 'minimalistic-assert'
declare module 'events/'
declare module '@exodus/atom-tests'
declare module '@exodus/basic-utils'

declare module '@exodus/storage-memory' {
  import type { Storage } from '@exodus/storage-interface'

  function createInMemoryStorage<In, Out = In>(): Storage<In, Out>
  export default createInMemoryStorage
}
