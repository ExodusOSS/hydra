import { WalletAccount } from '@exodus/models'

import createExodus from './exodus'

const HEX_STRING = /[\da-f]/i

describe('key-viewer', () => {
  let exodus

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    const container = createExodus()

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
  })

  test('should get receive address if wallet unlocked', async () => {
    await exodus.wallet.unlock({ passphrase })

    const key = await exodus.keyViewer.getEncodedPrivateKey({
      baseAssetName: 'bitcoin',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(key).toMatch(HEX_STRING)
  })
})
