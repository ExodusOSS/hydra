import type { KeychainApi } from '@exodus/keychain/api'
import type KeyIdentifier from '@exodus/key-identifier'

export type Keychain = KeychainApi

export type KeySource = {
  keyId: KeyIdentifier
  seedId: string
}
