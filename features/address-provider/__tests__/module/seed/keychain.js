import { getPublicKey as getAlgorandPublicKey } from '@exodus/algorand-lib'
import { getPublicKey as getCardanoPublicKey } from '@exodus/cardano-lib'
import keychainFactory from '@exodus/keychain'
import { getPublicKey as getSolanaPublicKey } from '@exodus/solana-lib'
// NON-HDKEY ASSETS

const ASSET_PRIV_TO_PUB = Object.assign(Object.create(null), {
  solana: getSolanaPublicKey,
  algorand: getAlgorandPublicKey,
  cardano: getCardanoPublicKey,
})

// We create a keychain with the legacy priv to pub mappers
export const createKeychain = async ({ seed }) => {
  const keychain = keychainFactory()
    .definitions.find(({ definition }) => definition.id === 'keychain')
    .definition.factory({ legacyPrivToPub: ASSET_PRIV_TO_PUB })
  await keychain.unlock(seed)

  return keychain
}
