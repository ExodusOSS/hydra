import publicKeyProviderDefinition, { mockablePublicKeyProviderDefinition } from './module/index.js'
import publicKeyProviderApiDefinition from './api/index.js'
import publicKeyStoreDefinition from './module/store/index.js'
import { softwareWalletPublicKeysAtomDefinition } from './atoms/index.js'
import publicKeyProviderDebugDefinition from './debug/index.js'
import publicKeyProviderDebugPluginDefinition from './plugin/debug.js'

type Dependencies = {
  debug?: boolean
}

const publicKeyProvider = ({ debug }: Dependencies = {}) => {
  return {
    id: 'publicKeyProvider',
    definitions: [
      {
        definition: debug
          ? { ...mockablePublicKeyProviderDefinition, id: publicKeyProviderDefinition.id }
          : publicKeyProviderDefinition,
      },
      { definition: publicKeyProviderApiDefinition },
      { definition: publicKeyStoreDefinition },
      { definition: softwareWalletPublicKeysAtomDefinition },
      { definition: publicKeyProviderDebugDefinition, if: Boolean(debug) },
      { definition: publicKeyProviderDebugPluginDefinition, if: Boolean(debug) },
    ],
  } as const
}

export default publicKeyProvider
