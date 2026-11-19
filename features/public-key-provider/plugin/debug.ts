import type { MockablePublicKeyProvider } from '../module/index.js'
import type { Definition } from '@exodus/dependency-types'
import type { BlockchainMetadata } from '../module/utils/types.js'
import type { Atom } from '@exodus/atoms'

type Dependencies = {
  publicKeyProvider: MockablePublicKeyProvider
  blockchainMetadata: BlockchainMetadata
  activeWalletAccountAtom: Atom<string>
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
