import { waitUntil } from '@exodus/atoms'
import { normalizeTxsJSON, WalletAccount } from '@exodus/models'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import TX_LOGS from './fixtures/tx-logs.js'

describe('balances', () => {
  let adapters
  let exodus
  let reportNode
  let container

  const passphrase = 'my-password-manager-generated-this'
  const setupWallet = async ({ createWallet = true } = {}) => {
    adapters = createAdapters()

    container = createExodus({ adapters, config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
      await exodus.application.unlock({ passphrase })
    }

    reportNode = container.getByType('report').balancesReport
  }

  beforeEach(setupWallet)
  afterEach(() => exodus.application.stop())

  test('balancesAtom emits balances', async () => {
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

  test('should successfully export report (pre-wallet-exists)', async () => {
    await exodus.application.stop() // stop the instance from beforeEach
    await setupWallet({ createWallet: false })
    await expect(exodus.wallet.exists()).resolves.toEqual(false)
    await expect(exodus.reporting.export()).resolves.toEqual(
      expect.objectContaining({
        balances: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
      })
    )
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await expect(exodus.wallet.exists()).resolves.toEqual(true)
    await expect(exodus.reporting.export()).resolves.toEqual(
      expect.objectContaining({
        balances: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
      })
    )
  })
})
