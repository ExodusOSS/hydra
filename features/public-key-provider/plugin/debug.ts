import type { MockablePublicKeyProvider } from '../module/index.js'
import type { Definition } from 'libraries/dependency-types/index.js'
import type { AssetsModule, BlockchainMetadata } from '../module/utils/types.js'
import type { Atom } from '@exodus/atoms'

type Dependencies = {
  publicKeyProvider: MockablePublicKeyProvider
  blockchainMetadata: BlockchainMetadata
  activeWalletAccountAtom: Atom<string>
  assetsModule: AssetsModule
}

const factory = ({ blockchainMetadata }: Dependencies) => {
  const onStart = async () => {
    await blockchainMetadata.clear()
  }

  return { onStart }
}

const publicKeyProviderDebugPluginDefinition = {
  id: 'publicKeyProviderDebugPlugin',
  type: 'plugin',
  factory,
  dependencies: ['blockchainMetadata'],
  public: true,
} as const satisfies Definition

export default publicKeyProviderDebugPluginDefinition
