import type { Definition } from '@exodus/dependency-types'
import type { MockablePublicKeyProvider } from '../module/index.js'

type Dependencies = {
  publicKeyProvider: MockablePublicKeyProvider
}

const factory = ({ publicKeyProvider }: Dependencies) => {
  return {
    publicKeyProvider: {
      mockXPub: publicKeyProvider.mockXPub,
      unmockXPub: publicKeyProvider.unmockXPub,
      clearAllMocks: publicKeyProvider.clearAllMocks,
    },
  }
}

const publicKeyProviderDebugDefinition = {
  id: 'publicKeyProviderDebug',
  type: 'debug',
  factory,
  dependencies: ['publicKeyProvider'],
  public: true,
} as const satisfies Definition

export default publicKeyProviderDebugDefinition
