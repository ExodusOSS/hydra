import { connectAssetsList } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import ethereumAssets from '@exodus/ethereum-meta'
import { WalletAccount, TxSet } from '@exodus/models'
import createSyncEarliestTxDatePlugin from '../sync-earliest-tx-plugin.js'
import blockchainMetadataDefinition from '../../module/index.js'
import createInMemoryStorage from '@exodus/storage-memory'

const assets = connectAssetsList(ethereumAssets)

const assetsModule = {
  getAsset: (name) => assets[name],
  getAssets: () => assets,
}

const tx = {
  txId: '0x0',
  error: null,
  date: '2019-07-22T13:54:28.000Z',
  confirmations: 1,
  meta: {},
  token: null,
  dropped: false,
  coinAmount: '-0.23637286 ETH',
  coinName: 'ethereum',
  feeAmount: '0.000189 ETH',
  feeCoinName: 'ethereum',
  to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
  currencies: { ethereum: assets.ethereum.currency },
}

describe('sync-earliest-tx-date-to-fusion-plugin', () => {
  let txLogsAtom,
    accountStatesAtom,
    plugin,
    earliestTxDateAtom,
    enabledWalletAccountsAtom,
    blockchainMetadata,
    storage

  beforeEach(async () => {
    storage = createInMemoryStorage()
    txLogsAtom = createInMemoryAtom()
    accountStatesAtom = createInMemoryAtom()
    earliestTxDateAtom = createInMemoryAtom({ defaultValue: null })
    enabledWalletAccountsAtom = createInMemoryAtom({
      defaultValue: { exodus_0: WalletAccount.DEFAULT },
    })

    blockchainMetadata = blockchainMetadataDefinition.factory({
      storage,
      assetsModule,
      txLogsAtom,
      accountStatesAtom,
      enabledWalletAccountsAtom,
      logger: console,
    })

    plugin = createSyncEarliestTxDatePlugin({
      logger: console,
      earliestTxDateAtom,
      txLogsAtom,
    })
  })

  it('returns an onAssetsSynced hook', () => {
    expect(typeof plugin.onAssetsSynced).toEqual('function')
  })

  it('updates earliestTxDateAtom', async () => {
    await blockchainMetadata.load()
    await plugin.onAssetsSynced()

    const awaitValues = (expectedValues) => {
      expectedValues = [...expectedValues]
      return new Promise((resolve) =>
        earliestTxDateAtom.observe((value) => {
          if (expectedValues.length > 0) {
            expect(value).toEqual(expectedValues.shift())
            if (expectedValues.length === 0) resolve()
          }
        })
      )
    }

    blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: TxSet.fromArray([tx]).toJSON(),
    })

    await awaitValues([null, '2019-07-22'])

    blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: TxSet.fromArray([
        {
          ...tx,
          txId: '0x1',
          date: '2019-07-23T13:54:28.000Z',
        },
      ]).toJSON(),
    })

    await awaitValues(['2019-07-22'])

    blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: TxSet.fromArray([
        {
          ...tx,
          txId: '0x2',
          date: '2019-07-21T13:54:28.000Z',
        },
      ]).toJSON(),
    })

    await awaitValues(['2019-07-22', '2019-07-21'])
  })
})
