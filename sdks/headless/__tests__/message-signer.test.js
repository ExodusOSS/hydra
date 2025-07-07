import { mnemonicToSeed } from '@exodus/bip39'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import { WalletAccount } from '@exodus/models'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('message-signer', async () => {
  let exodus

  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
  const seed = await mnemonicToSeed({ mnemonic })
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

  afterEach(() => exodus.application.stop())

  test('signs message', async () => {
    await exodus.application.unlock({ passphrase })

    const signature = await exodus.messageSigner.signMessage({
      baseAssetName: 'ethereum',
      walletAccount: new WalletAccount({ ...WalletAccount.DEFAULT, seedId }),
      message: {
        rawMessage: Buffer.from('hello world'),
      },
    })

    expect(signature.toString('hex')).toEqual(
      'accb153753251c638921868beb915d47987cfc7425dd30ab730e6f6a4224b9e433c1ec5810276c64a2022f85a4370264cb69fc0038d0b737591a489cebbb3af81b'
    )
  })
})
