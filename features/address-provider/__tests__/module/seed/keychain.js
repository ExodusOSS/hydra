import { getPublicKey as getAlgorandPublicKey } from '@exodus/algorand-lib'
import { getPublicKey as getCardanoPublicKey } from '@exodus/cardano-lib'
import keychainDefinition from '@exodus/keychain/module/index.js'
import { getPublicKey as getSolanaPublicKey } from '@exodus/solana-lib'
// NON-HDKEY ASSETS

const ASSET_PRIV_TO_PUB = Object.assign(Object.create(null), {
  solana: getSolanaPublicKey,
  algorand: getAlgorandPublicKey,
  cardano: getCardanoPublicKey,
})

// We create a keychain with the legacy priv to pub mappers
export const createKeychain = ({ seed }) => {
  const keychain = keychainDefinition.factory({ legacyPrivToPub: ASSET_PRIV_TO_PUB })
  keychain.addSeed(seed)

  return keychain
}
