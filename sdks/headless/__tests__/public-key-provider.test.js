import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import { KeyIdentifier } from '@exodus/keychain/module'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import { createNoopLogger } from '@exodus/logger'
import { WalletAccount } from '@exodus/models'
import { mnemonicToSeed } from 'bip39'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

const bitcoin = createBitcoin({ assetClientInterface: { createLogger: createNoopLogger } })

describe('public-key-provider', () => {
  /** @type {import('../src/index').ExodusApi} */
  let exodus

  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
  const seed = mnemonicToSeed(mnemonic)
  const seedId = getSeedId(seed)
  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    const adapters = createAdapters()
    const container = createExodus({ adapters, config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.import({ mnemonic, passphrase })
  })

  test('exports public key', async () => {
    await exodus.application.unlock({ passphrase })

    const keyIdentifier = new KeyIdentifier(
      bitcoin.api.getKeyIdentifier({
        purpose: 44,
        accountIndex: 0,
      })
    )

    const publicKey = await exodus.publicKeyProvider.getPublicKey({
      walletAccount: new WalletAccount({ ...WalletAccount.DEFAULT, seedId }),
      keyIdentifier,
    })

    expect(publicKey.toString('hex')).toEqual(
      '037aa51c9e0b87841443f2ef3c1cefe18f73a4226917793a964d40d8468e6fda49'
    )
  })
})
