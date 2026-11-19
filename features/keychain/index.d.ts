import keychainApiDefinition from './api/index.js'
import type { Keychain } from './module/keychain.js'

export { Keychain } from './module/keychain.js'
export type { KeychainApi } from './api/index.js'

declare const keychainModuleDefinition: {
  id: 'keychain'
  type: 'module'
  public: true
  factory(args?: object): Keychain
  dependencies: readonly ['legacyPrivToPub?']
}

declare const keychain: () => {
  id: 'keychain'
  definitions: [
    { definition: typeof keychainModuleDefinition },
    { definition: typeof keychainApiDefinition },
  ]
}

export default keychain
