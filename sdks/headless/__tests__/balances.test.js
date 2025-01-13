import { waitUntil } from '@exodus/atoms'
import { normalizeTxsJSON, WalletAccount } from '@exodus/models'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import TX_LOGS from './fixtures/tx-logs'

describe('balances', () => {
  let adapters

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()
  })

  test('balancesAtom emits balances', async () => {
    const container = createExodus({ adapters, config })

    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const { blockchainMetadata, assetsModule } = container.getAll()
    const assets = assetsModule.getAssets()
    const txLogs = normalizeTxsJSON({ json: TX_LOGS.bitcoin, assets })
    blockchainMetadata.updateTxs({
      assetName: 'bitcoin',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: [txLogs[0]],
    })

    const { balancesAtom } = container.getAll()
    await waitUntil({
      atom: balancesAtom,
      predicate: (payload) => {
        return (
          !!payload.balances[WalletAccount.DEFAULT_NAME].bitcoin &&
          !payload.balances[WalletAccount.DEFAULT_NAME].bitcoin.balance.isZero
        )
      },
    })

    const currentBalances = await balancesAtom.get()
    expect(currentBalances.balances[WalletAccount.DEFAULT_NAME].bitcoin).toEqual({
      balance: assetsModule.getAsset('bitcoin').currency.defaultUnit('0.00169844'),
      total: assetsModule.getAsset('bitcoin').currency.defaultUnit('0.00169844'),
      spendableBalance: assetsModule.getAsset('bitcoin').currency.defaultUnit('0.00169844'),
      spendable: assetsModule.getAsset('bitcoin').currency.defaultUnit('0.00169844'),
    })
  })
})
