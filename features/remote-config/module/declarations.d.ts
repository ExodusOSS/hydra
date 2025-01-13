declare module '@exodus/basic-utils'

declare module '@exodus/module' {
  import { EventEmitter } from 'events/'

  class ExodusModule extends EventEmitter {
    constructor(options?: { name: string; logger?: any })
  }

  export = ExodusModule
}
