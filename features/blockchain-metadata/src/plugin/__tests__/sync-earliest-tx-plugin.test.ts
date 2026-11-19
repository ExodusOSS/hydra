import { connectAssetsList } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import ethereumAssets from '@exodus/ethereum-meta'
import { normalizeTxsJSON, TxSet, WalletAccount } from '@exodus/models'
import createInMemoryStorage from '@exodus/storage-memory'

import { txLogsAtomDefinition } from '../../atoms/index.js'
import blockchainMetadataDefinition from '../../module/index.js'
import type {
  AssetsModule,
  BlockchainMetadata,
  BlockchainMetadataAtom,
  BlockchainMetadataAtomValue,
  Logger,
  TxJson,
  TxLogsAtom,
  WalletAccountsRecord,
} from '../../types.js'
import createSyncEarliestTxDatePlugin from '../sync-earliest-tx-plugin.js'

const assets = connectAssetsList(ethereumAssets)

const assetsModule: AssetsModule = {
  getAsset: (name: string) => assets[name]!,
  getAssets: () => assets,
}

const tx = {
  txId: '0x0',
  error: null,
  date: '2019-07-22T13:54:28.000Z',
  confirmations: 1,
  meta: {},
  dropped: false,
  coinAmount: '-0.23637286 ETH',
  coinName: 'ethereum',
  feeAmount: '0.000189 ETH',
  feeCoinName: 'ethereum',
  to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
  currencies: { ethereum: assets.ethereum!.currency },
}

const createLogger = (): Logger => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
})

const createTxLog = (updates: Partial<TxJson> = {}): TxSet =>
  TxSet.fromArray(normalizeTxsJSON({ json: [{ ...tx, ...updates }], assets }))

describe('sync-earliest-tx-date-to-fusion-plugin', () => {
  let txLogsAtom: TxLogsAtom
  let blockchainMetadataAtom: BlockchainMetadataAtom
  let plugin: ReturnType<typeof createSyncEarliestTxDatePlugin>
  let earliestTxDateAtom: ReturnType<typeof createInMemoryAtom<string | undefined>>
  let enabledWalletAccountsAtom: ReturnType<typeof createInMemoryAtom<WalletAccountsRecord>>
  let blockchainMetadata: BlockchainMetadata
  let storage: ReturnType<typeof createInMemoryStorage>

  beforeEach(async () => {
    storage = createInMemoryStorage()
    blockchainMetadataAtom = createInMemoryAtom<BlockchainMetadataAtomValue>({
      defaultValue: { value: { txs: {}, accountStates: {} } },
    })
    txLogsAtom = txLogsAtomDefinition.factory({ blockchainMetadataAtom })
    earliestTxDateAtom = createInMemoryAtom<string | undefined>({ defaultValue: undefined })
    enabledWalletAccountsAtom = createInMemoryAtom<WalletAccountsRecord>({
      defaultValue: { exodus_0: WalletAccount.DEFAULT },
    })

    blockchainMetadata = blockchainMetadataDefinition.factory({
      storage,
      assetsModule,
      blockchainMetadataAtom,
      enabledWalletAccountsAtom,
      logger: createLogger(),
      errorTracking: { track: jest.fn() },
    })

    plugin = createSyncEarliestTxDatePlugin({
      logger: createLogger(),
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

    const awaitValues = (expectedValues: readonly (string | undefined)[]) => {
      const remaining = [...expectedValues]
      return new Promise<void>((resolve) =>
        earliestTxDateAtom.observe((value) => {
          if (remaining.length > 0) {
            expect(value).toEqual(remaining.shift())
            if (remaining.length === 0) resolve()
          }
        })
      )
    }

    jest.useFakeTimers()

    void blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: createTxLog().toJSON(),
    })

    await Promise.all([jest.advanceTimersByTimeAsync(1000), awaitValues([undefined, '2019-07-22'])])

    void blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: createTxLog({ txId: '0x1', date: '2019-07-23T13:54:28.000Z' }).toJSON(),
    })

    await awaitValues(['2019-07-22'])

    // Does not change after time passed
    await Promise.all([jest.advanceTimersByTimeAsync(1000), awaitValues(['2019-07-22'])])

    void blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      txs: createTxLog({ txId: '0x2', date: '2019-07-21T13:54:28.000Z' }).toJSON(),
    })

    await Promise.all([
      jest.advanceTimersByTimeAsync(1000),
      awaitValues(['2019-07-22', '2019-07-21']),
    ])

    jest.useRealTimers()

    await plugin.onStop()
  })
})
