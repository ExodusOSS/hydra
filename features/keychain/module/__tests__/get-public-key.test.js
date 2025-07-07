import { mnemonicToSeed } from 'bip39'

import createKeychain from './create-keychain.js'
import { getSeedId } from '../crypto/seed-id.js'
import KeyIdentifier from '@exodus/key-identifier'

const seed = mnemonicToSeed(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const seedId = getSeedId(seed)

describe('keychain.getPublicKey', () => {
  const keychain = createKeychain({ seed })

  it('gets the correct key for keyType "cardanoByron"', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: "m/44'/1815'/0'/0/0",
      derivationAlgorithm: 'BIP32',
      keyType: 'cardanoByron',
    })

    const expected = 'b45e8123277ae328d07adfe64d8dedb54f44aa4346eb2fb9d544dd2bc2060f4e'

    const publicKey = await keychain.getPublicKey({ seedId, keyId })

    expect(publicKey.toString('hex')).toBe(expected)
  })
})
