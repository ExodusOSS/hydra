import { createInMemoryAtom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { normalizeTxsJSON, TxSet, WalletAccount } from '@exodus/models'
import createStorage from '@exodus/storage-memory'

import {
  accountStatesAtomDefinition,
  blockchainMetadataAtomDefinition,
  txLogsAtomDefinition,
} from '../../atoms/index.js'
import type {
  AccountStatesAtom,
  Asset,
  AssetsByName,
  AssetsModule,
  BlockchainMetadata,
  BlockchainMetadataAtom,
  BlockchainMetadataDependencies,
  ErrorTracking,
  Logger,
  TxJson,
  TxLogMap,
  TxLogsAtom,
  WalletAccountsRecord,
} from '../../types.js'
import definition from '../index.js'
import { AccountStates } from './test-utils.js'
import _fixtures from './tx-log-fixtures.cjs'

const getLastCallArgs = (jestFn: { mock: { calls: readonly object[][] } }) =>
  [...jestFn.mock.calls].pop()
const updateDate = new Date('2023-07-07')

// this could have been setImmediate, process.nextTick, or even for (let i = 0; i < 5; i++) await Promise.resolve()
// but setTimeout won't hurt us and it's more portable than setImmediate / process.nextTick in case if we run on other engines
// (and for `for ... await Promise.resolve()` loop we don't know an exact constant as new tests might get added)
const flushPendingPromises = async () => new Promise((resolve) => setTimeout(resolve, 0))

// allow: minimal test stubs — only the fields the blockchain-metadata module reads are populated
const bitcoin = {
  name: 'bitcoin',
  currency: UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  }),
  get baseAsset() {
    return bitcoin
  },
  get feeAsset() {
    return bitcoin
  },
  api: { createAccountState: () => AccountStates.bitcoin },
} as unknown as Asset // allow: test fixture

const ethereum = {
  ...ethereumMeta,
  get baseAsset(): Asset {
    return ethereum as unknown as Asset // allow: test fixture
  },
  get feeAsset(): Asset {
    return ethereum as unknown as Asset // allow: test fixture
  },
  api: {},
} as unknown as Asset // allow: test fixture

const assets: AssetsByName = { bitcoin, ethereum }
const assetsModule: AssetsModule = {
  getAsset: (assetName: string) => assets[assetName]!,
  getAssets: () => assets,
}

const createTxSet = (txs: readonly TxJson[]) =>
  TxSet.fromArray(
    normalizeTxsJSON({
      json: txs.map((tx) => ({
        ...tx,
        coinName: tx.coinName ?? bitcoin.name,
        currencies: tx.currencies ?? currencies,
      })),
      assets,
    })
  )
const getObservedTxLogs = (payload: TxLogMap | { value: TxLogMap }): TxLogMap =>
  // allow: observer payloads are a legacy union of raw maps and wrapped value objects
  ((payload as { value?: TxLogMap }).value ?? payload) as TxLogMap
const currencies = { bitcoin: bitcoin.currency }

const fixtures = mapValues({ bitcoin: _fixtures.bitcoin ?? [] }, (json) =>
  normalizeTxsJSON({ json: [...json], assets })
)
const firstBitcoinTx = fixtures.bitcoin[0]!
const secondBitcoinTx = fixtures.bitcoin[1]!

const createLogger = (): Logger => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
})

type CreateBlockchainMetadataArgs = Partial<BlockchainMetadataDependencies> &
  Pick<BlockchainMetadataDependencies, 'storage' | 'enabledWalletAccountsAtom'> & {
    txLogsAtom?: TxLogsAtom
    accountStatesAtom?: AccountStatesAtom
  }

const createBlockchainMetadata = ({
  storage,
  enabledWalletAccountsAtom,
  assetsModule: customAssetsModule = assetsModule,
  blockchainMetadataAtom = blockchainMetadataAtomDefinition.factory(),
  logger = createLogger(),
  errorTracking = { track: jest.fn() },
}: CreateBlockchainMetadataArgs): BlockchainMetadata =>
  definition.factory({
    assetsModule: customAssetsModule,
    storage,
    enabledWalletAccountsAtom,
    blockchainMetadataAtom,
    logger,
    errorTracking,
  })

describe('blockchain metadata module', () => {
  let storage: ReturnType<typeof createStorage>

  let blockchainMetadata: BlockchainMetadata
  let txLogsAtom: TxLogsAtom
  let accountStatesAtom: AccountStatesAtom
  let blockchainMetadataAtom: BlockchainMetadataAtom
  let enabledWalletAccountsAtom: ReturnType<typeof createInMemoryAtom<WalletAccountsRecord>>
  let errorTracking: ErrorTracking

  beforeEach(async () => {
    enabledWalletAccountsAtom = createInMemoryAtom<WalletAccountsRecord>({ defaultValue: {} })
    blockchainMetadataAtom = blockchainMetadataAtomDefinition.factory()
    txLogsAtom = txLogsAtomDefinition.factory({ blockchainMetadataAtom })
    accountStatesAtom = accountStatesAtomDefinition.factory({ blockchainMetadataAtom })
    errorTracking = {
      track: jest.fn(),
    }

    storage = createStorage()
    blockchainMetadata = createBlockchainMetadata({
      assetsModule,
      storage,
      enabledWalletAccountsAtom,
      blockchainMetadataAtom,
      logger: createLogger(),
      errorTracking,
    })

    await blockchainMetadata.load()
    await flushPendingPromises()
  })

  async function loadDefaultWalletAccount() {
    await enabledWalletAccountsAtom.set({ exodus_0: WalletAccount.DEFAULT })
    // enabledWalletAccountsAtom set is sync, wait a tick for event handlers to be processed before this resolves
    await new Promise(setImmediate)
  }

  test('getAccountState returns account state', async () => {
    await blockchainMetadata.updateAccountState({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
      newData: { cursor: 'some-cursor' },
    })

    const value = await blockchainMetadata.getAccountState({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })

    expect(value).toEqual(
      AccountStates.bitcoin.deserialize({ cursor: 'some-cursor', balance: '0 BTC' })
    )
  })

  describe('getLoadedTxLogs', () => {
    const initialPayload = {
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
      txs: [firstBitcoinTx],
    }

    test('returns txs set by addTxs', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.addTxs(initialPayload)

      const actual = await blockchainMetadata.getLoadedTxLogs()
      expect(actual).toEqual({
        exodus_0: expect.objectContaining({
          bitcoin: TxSet.fromArray([firstBitcoinTx]),
        }),
      })

      await expect(txLogsAtom.get()).resolves.toMatchSnapshot()
    })

    test('returns txs set by updateTxs', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.updateTxs(initialPayload)

      const actual = await blockchainMetadata.getLoadedTxLogs()
      expect(actual).toEqual({
        exodus_0: expect.objectContaining({
          bitcoin: TxSet.fromArray([firstBitcoinTx]),
        }),
      })

      await expect(txLogsAtom.get()).resolves.toMatchSnapshot()
    })

    test('returns txs not mutated by consequent `updateTxs`', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.updateTxs(initialPayload)

      const actual = await blockchainMetadata.getLoadedTxLogs()

      const laterPayload = {
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: [firstBitcoinTx, secondBitcoinTx],
      }
      await blockchainMetadata.updateTxs(laterPayload)

      expect(actual).toEqual({
        exodus_0: expect.objectContaining({
          bitcoin: TxSet.fromArray([firstBitcoinTx]),
        }),
      })

      await expect(txLogsAtom.get()).resolves.toMatchSnapshot()
    })

    test('txLogsAtom has merged state', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.updateTxs(initialPayload)
      await blockchainMetadata.updateTxs({
        ...initialPayload,
        txs: [secondBitcoinTx],
      })

      await expect(txLogsAtom.get()).resolves.toMatchSnapshot()
    })
  })

  describe('getLoadedAccountStates', () => {
    const initialAccountState = AccountStates.bitcoin.deserialize({
      cursor: 'some-cursor',
      balance: '0 BTC',
    })

    test('returns state set by updateAccountState', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: initialAccountState,
      })

      const actual = await blockchainMetadata.getLoadedAccountStates()
      expect(actual).toEqual({
        exodus_0: expect.objectContaining({
          bitcoin: initialAccountState,
        }),
      })

      await expect(accountStatesAtom.get()).resolves.toMatchSnapshot()
    })

    test('returns state not mutated by consequent `updateAccountState`', async () => {
      await loadDefaultWalletAccount()
      const firstPayload = {
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: initialAccountState,
      }
      await blockchainMetadata.updateAccountState(firstPayload)

      const actual = await blockchainMetadata.getLoadedAccountStates()

      const laterPayload = {
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: AccountStates.bitcoin.deserialize({ cursor: 'some-cursor', balance: '2 BTC' }),
      }
      await blockchainMetadata.updateAccountState(laterPayload)
      expect(actual).toEqual({
        exodus_0: expect.objectContaining({
          bitcoin: initialAccountState,
        }),
      })
    })

    test('accountStatesAtom has merged state', async () => {
      await loadDefaultWalletAccount()
      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: AccountStates.bitcoin.deserialize({
          cursor: 'some-cursor',
          balance: '1 BTC',
        }),
      })

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: AccountStates.bitcoin.deserialize({
          cursor: 'some-cursor',
          balance: '2 BTC',
        }),
      })

      await expect(accountStatesAtom.get()).resolves.toMatchSnapshot()
    })
  })

  describe('clear', () => {
    const assetName = 'bitcoin'
    const walletAccount = 'exodus_0'

    test('resets account state', async () => {
      const AccountState = bitcoin.api.createAccountState!()
      await blockchainMetadata.updateAccountState({
        assetName,
        walletAccount,
        newData: { cursor: 'some-cursor' },
      })
      await blockchainMetadata.clear()

      await expect(
        blockchainMetadata.getAccountState({ assetName, walletAccount })
      ).resolves.toEqual(AccountState.create())

      await expect(accountStatesAtom.get()).resolves.toEqual({
        value: {},
        changes: undefined,
      })
    })

    test('resets tx log', async () => {
      await blockchainMetadata.updateTxs({
        assetName,
        walletAccount,
        txs: [firstBitcoinTx],
      })
      await blockchainMetadata.clear()

      await expect(blockchainMetadata.getTxLog({ assetName, walletAccount })).resolves.toEqual(
        TxSet.EMPTY
      )
      await expect(txLogsAtom.get()).resolves.toEqual({
        value: {},
        changes: undefined,
        newlyReceivedTxLogs: undefined,
      })
    })
  })

  describe('load', () => {
    test('loads persisted base state and token transactions together', async () => {
      const token: Asset = {
        ...ethereum,
        name: 'ethereumToken',
        baseAsset: ethereum,
        api: bitcoin.api,
      }
      const assetsWithToken: AssetsByName = { [token.name]: token, ethereum, bitcoin }
      const accountState = AccountStates.bitcoin.create({
        cursor: 'persisted-cursor',
        balance: '3 BTC',
      })
      const tokenTxLog = TxSet.fromArray([
        {
          txId: 'token transaction',
          date: updateDate,
          coinAmount: token.currency.defaultUnit(2),
          coinName: token.name,
          currencies: { [token.name]: token.currency },
        },
      ])
      await storage.namespace('states').batchSet({
        'exodus_0:bitcoin': accountState.toJSON(),
        'exodus_0:ethereumToken': { cursor: 'ignored-token-state' },
      })
      await storage.namespace('txs').set('exodus_0:ethereumToken', tokenTxLog.toJSON())

      const metadata = createBlockchainMetadata({
        storage,
        enabledWalletAccountsAtom: createInMemoryAtom<WalletAccountsRecord>({
          defaultValue: { exodus_0: WalletAccount.DEFAULT },
        }),
        assetsModule: {
          getAssets: () => assetsWithToken,
          getAsset: (assetName) => assetsWithToken[assetName]!,
        },
      })
      await metadata.load()

      await expect(metadata.getLoadedAccountStates()).resolves.toEqual({
        exodus_0: { bitcoin: accountState },
      })
      const loadedTxLog = await metadata.getTxLog({
        assetName: token.name,
        walletAccount: 'exodus_0',
      })
      expect(loadedTxLog.equals(tokenTxLog)).toBe(true)
    })

    test('emits load-wallet-accounts event', async () => {
      const handler = jest.fn()

      blockchainMetadata.on('load-wallet-accounts', handler)

      await loadDefaultWalletAccount()

      expect(handler).toHaveBeenCalledWith({ walletAccounts: ['exodus_0'] })
    })

    test('asset sources are loaded independently', async () => {
      const ethereumTxLog = TxSet.fromArray([
        {
          txId: 'the tx',
          date: updateDate,
          coinAmount: ethereum.currency.ZERO,
          coinName: 'ethereum',
          currencies: { ethereum: ethereum.currency },
        },
      ])
      await storage.namespace('txs').batchSet({
        'exodus_0:bitcoin': ['malformed'],
        'exodus_0:ethereum': ethereumTxLog.toJSON(),
      })

      const loadWalletAccountsHandler = jest.fn()
      blockchainMetadata.once('load-wallet-accounts', loadWalletAccountsHandler)

      await loadDefaultWalletAccount()

      expect(loadWalletAccountsHandler).toHaveBeenCalledWith({
        walletAccounts: ['exodus_0'],
      })

      expect(errorTracking.track).toHaveBeenCalledWith({
        context: { assetName: 'bitcoin', walletAccount: 'exodus_0' },
        error: new Error('normalizeTxJSON: `asset` object and `coinName` are required'),
      })

      const loadedEthereumTxLog = await blockchainMetadata.getTxLog({
        assetName: 'ethereum',
        walletAccount: 'exodus_0',
      })

      expect(loadedEthereumTxLog.equals(ethereumTxLog)).toBe(true)
    })

    test("doesn't resubscribe to walletAccountsAtom when called again", () => {
      const observe = jest.fn()
      const bm = createBlockchainMetadata({
        storage,
        enabledWalletAccountsAtom: {
          get: jest.fn(),
          observe,
        },
        txLogsAtom,
        accountStatesAtom,
      })

      void bm.load()
      expect(observe).toHaveBeenCalledTimes(1)
      void bm.load()
      expect(observe).toHaveBeenCalledTimes(1)
    })

    test('resubscribes to walletAccountsAtom when called again after stopping', () => {
      const unsubscribe = jest.fn()
      const observe = jest.fn(() => unsubscribe)
      const bm = createBlockchainMetadata({
        storage,
        enabledWalletAccountsAtom: {
          get: jest.fn(),
          observe,
        },
        txLogsAtom,
        accountStatesAtom,
      })

      void bm.load()
      expect(observe).toHaveBeenCalledTimes(1)

      bm.stop()
      void bm.load()

      expect(unsubscribe).toHaveBeenCalled()
      expect(observe).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateTxs', () => {
    test('emits tx event for asset source', async () => {
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })

      await expect(txLogsAtom.get()).resolves.toMatchSnapshot()
    })

    test('does not emit tx-log when unchanged', async () => {
      const namespace = storage.namespace('txs')
      await namespace.set('exodus_0:bitcoin', fixtures.bitcoin)
      await loadDefaultWalletAccount()

      const observer = jest.fn()
      txLogsAtom.observe(observer)

      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })

      expect(observer).toHaveBeenCalledTimes(1)
    })

    test('persists txs in storage', async () => {
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })

      const value = await storage.namespace('txs').get('exodus_0:bitcoin')
      expect(Array.isArray(value)).toBe(true)
      if (!Array.isArray(value)) {
        throw new TypeError('expected tx storage payload to be an array')
      }

      expect(createTxSet(value as readonly TxJson[])).toEqual(createTxSet(fixtures.bitcoin)) // allow: storage test narrows unknown persistence payload with the runtime array check above
    })

    test('updates tx properties', async () => {
      const tx = firstBitcoinTx

      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: [tx],
      })

      let { value, changes, newlyReceivedTxLogs } = await txLogsAtom.get()
      expect(newlyReceivedTxLogs).toEqual({
        exodus_0: {
          bitcoin: TxSet.fromArray([tx]),
        },
      })

      const updatedTxs = [{ ...tx, confirmations: (tx.confirmations ?? 0) + 1 }]
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: updatedTxs,
      })

      // atom
      ;({ value, changes, newlyReceivedTxLogs } = await txLogsAtom.get())
      expect(newlyReceivedTxLogs).toEqual(undefined)
      expect(changes).toEqual({
        exodus_0: {
          bitcoin: TxSet.fromArray(updatedTxs),
        },
      })

      expect(value.exodus_0?.bitcoin?.getAt(0)?.confirmations).toEqual(2)
    })
  })

  describe('updateAccountState', () => {
    test('emits account-state changes per asset-source', async () => {
      const observer = jest.fn()
      const accountState = { cursor: 'some-cursor' }

      accountStatesAtom.observe(observer)

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { cursor: 'some-cursor' },
      })

      expect(observer).toHaveBeenLastCalledWith(
        expect.objectContaining({
          changes: {
            exodus_0: {
              bitcoin: AccountStates.bitcoin.deserialize(accountState),
            },
          },
        })
      )
    })

    test('does not emit account-state event when unchanged', async () => {
      const accountState = AccountStates.bitcoin.create({ cursor: 'some-cursor' })

      const namespace = storage.namespace('states')
      await namespace.set('exodus_0:bitcoin', accountState.toJSON())

      await loadDefaultWalletAccount()

      const observer = jest.fn()
      accountStatesAtom.observe(observer)

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: accountState,
      })

      expect(observer).toHaveBeenCalledTimes(1)
    })

    test('updates existing state', async () => {
      const observer = jest.fn()
      accountStatesAtom.observe(observer)

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { cursor: 'some-cursor' },
      })

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { balance: '1 BTC' },
      })

      const accountState = { cursor: 'some-cursor', balance: '1 BTC' }

      expect(observer).toHaveBeenLastCalledWith(
        expect.objectContaining({
          changes: {
            exodus_0: {
              bitcoin: AccountStates.bitcoin.deserialize(accountState),
            },
          },
        })
      )
    })

    test('does not fire event when no-op merge', async () => {
      const observer = jest.fn()

      accountStatesAtom.observe(observer)

      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { balance: '0 BTC' },
      })

      expect(observer).toHaveBeenCalledTimes(1) // initial value
    })

    test('persists states in storage', async () => {
      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { cursor: 'some-cursor' },
      })

      const value = await storage.namespace('states').get('exodus_0:bitcoin')

      // Note the merge is to force the _version: 1 field.
      expect(value).toEqual(
        AccountStates.bitcoin.serialize(
          AccountStates.bitcoin.create().merge({ cursor: 'some-cursor', balance: '0 BTC' })
        )
      )
    })
  })

  describe('removeTxs', () => {
    beforeEach(async () => {
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })
      await flushPendingPromises()
    })

    test('emits tx event for asset source', async () => {
      const observer = jest.fn()
      txLogsAtom.observe(observer)

      await blockchainMetadata.removeTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })

      expect(observer).toHaveBeenLastCalledWith(
        expect.objectContaining({
          changes: {
            exodus_0: {
              bitcoin: createTxSet([]),
            },
          },
        })
      )
    })
  })

  describe('overwriteTxs', () => {
    beforeEach(async () => {
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_1',
        txs: fixtures.bitcoin,
      })
      await flushPendingPromises()
    })

    test('replaces existing txs', async () => {
      const observer = jest.fn()
      txLogsAtom.observe(observer)

      const txs = [{ txId: 'the-new-tx-id', date: updateDate, currencies }]
      await blockchainMetadata.overwriteTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_1',
        txs,
      })

      const newTxSet = createTxSet(txs)

      const loadedTxs = await blockchainMetadata.getLoadedTxLogs()

      expect(loadedTxs['exodus_1']?.['bitcoin']?.toJSON()).toEqual(newTxSet.toJSON())
      expect(getLastCallArgs(observer)).toMatchSnapshot()
    })

    test('replaces existing txs with notifying about received txs', async () => {
      const observer = jest.fn()
      txLogsAtom.observe(observer)

      const txs = [
        {
          txId: 'the-new-tx-id',
          date: updateDate,
          coinAmount: '1 BTC',
          coinName: 'bitcoin',
          currencies,
        },
      ]
      await blockchainMetadata.overwriteTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_1',
        txs,
        notifyReceivedTxs: true,
      })

      const newTxSet = createTxSet(txs)

      const loadedTxs = await blockchainMetadata.getLoadedTxLogs()

      expect(loadedTxs['exodus_1']?.['bitcoin']?.toJSON()).toEqual(newTxSet.toJSON())
      expect(getLastCallArgs(observer)).toMatchSnapshot()
    })
  })

  describe('clearTxs', () => {
    beforeEach(async () => {
      await blockchainMetadata.updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: fixtures.bitcoin,
      })
      await flushPendingPromises()
    })

    test('removes existing txs', async () => {
      const observer = jest.fn()
      txLogsAtom.observe(observer)

      await blockchainMetadata.clearTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })

      const loadedTxs = await blockchainMetadata.getLoadedTxLogs()

      expect(loadedTxs['exodus_0']?.['bitcoin']?.toJSON()).toEqual(TxSet.EMPTY.toJSON())
      expect(getLastCallArgs(observer)).toMatchSnapshot()
    })
  })

  describe('removeAccountState', () => {
    beforeEach(async () => {
      await blockchainMetadata.updateAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        newData: { cursor: 'some-cursor', balance: '22 BTC' },
      })
      await flushPendingPromises()
    })

    test('overrides state with empty state in storage', async () => {
      await blockchainMetadata.removeAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })

      const value = await storage.namespace('states').get('exodus_0:bitcoin')

      expect(value).toEqual(AccountStates.bitcoin.create().toJSON())
    })

    test('emits account-states-update event for asset source', async () => {
      const observer = jest.fn()
      accountStatesAtom.observe(observer)
      await blockchainMetadata.removeAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })

      expect(getLastCallArgs(observer)).toMatchSnapshot()
    })

    test('no-ops for non-existing state', async () => {
      const handler = jest.fn()
      blockchainMetadata.once('account-state', handler)

      const observer = jest.fn()
      accountStatesAtom.observe(observer)

      await blockchainMetadata.removeAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_42',
      })

      const value = await storage.namespace('states').get('exodus_42:bitcoin')

      expect(value).toBeUndefined()
      expect(handler).not.toHaveBeenCalled()
      expect(observer).toHaveBeenCalledTimes(1)
    })

    test('does not emit when existing state is empty', async () => {
      // make sure the existing state is an empty
      await blockchainMetadata.removeAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })

      const handler = jest.fn()
      blockchainMetadata.once('account-state', handler)

      const observer = jest.fn()
      accountStatesAtom.observe(observer)

      await blockchainMetadata.removeAccountState({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })

      expect(handler).not.toHaveBeenCalled()
      expect(observer).toHaveBeenCalledTimes(1)
    })
  })

  describe('batch', () => {
    const accountState0 = { cursor: 'some-cursor', balance: '22 BTC' }
    const accountState1 = { cursor: 'the-cursor', balance: '42 BTC' }
    beforeEach(async () => {
      await enabledWalletAccountsAtom.set({
        exodus_0: WalletAccount.DEFAULT,
        exodus_1: {
          ...WalletAccount.DEFAULT,
          index: 1,
          label: 'Exodus 1',
        },
      })
      await flushPendingPromises()
    })

    describe('txs', () => {
      it('should batch updates and emit once', async () => {
        const observer = jest.fn()
        txLogsAtom.observe(observer)

        const transactions1 = fixtures.bitcoin
        const transactions2 = [...fixtures.bitcoin, { ...firstBitcoinTx, txId: 'wayne-foundation' }]

        await blockchainMetadata
          .batch()
          .updateTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txs: transactions1,
          })
          .updateTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_1',
            txs: transactions2,
          })
          .commit()

        const expectTransactions = (
          transactions: {
            walletAccount: string
            assetName: string
            txLog: TxJson[]
          }[]
        ) => ({
          asymmetricMatch: (payload: TxLogMap | { value: TxLogMap }) => {
            const txLogs = getObservedTxLogs(payload)

            for (const { walletAccount, assetName, txLog } of transactions) {
              const actual = txLogs[walletAccount]?.[assetName]
              if (!actual || !actual.equals(createTxSet(txLog))) return false
            }

            return true
          },
        })

        const expectedTransactions = expectTransactions([
          {
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txLog: transactions1,
          },
          {
            assetName: 'bitcoin',
            walletAccount: 'exodus_1',
            txLog: transactions2,
          },
        ])

        expect(observer).toHaveBeenLastCalledWith(expectedTransactions)

        await expect(blockchainMetadata.getLoadedTxLogs()).resolves.toEqual({
          exodus_0: expect.objectContaining({ bitcoin: createTxSet(transactions1) }),
          exodus_1: expect.objectContaining({ bitcoin: createTxSet(transactions2) }),
        })

        await expect(txLogsAtom.get().then(({ value }) => value)).resolves.toEqual({
          exodus_0: expect.objectContaining({ bitcoin: createTxSet(transactions1) }),
          exodus_1: expect.objectContaining({ bitcoin: createTxSet(transactions2) }),
        })
      })

      it('should dedupe on remove of same asset source', async () => {
        const observer = jest.fn()
        txLogsAtom.observe(observer)

        await blockchainMetadata
          .batch()
          .updateTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txs: fixtures.bitcoin,
          })
          .removeTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txs: fixtures.bitcoin,
          })
          .commit()

        expect(observer).toHaveBeenCalledTimes(2) // initial + update
        expect(getLastCallArgs(observer)).toMatchSnapshot()
      })

      it('should dedupe on update of the same asset source', async () => {
        const observer = jest.fn()
        txLogsAtom.observe(observer)

        const transaction = { ...firstBitcoinTx, txId: 'wayne-foundation' }

        await blockchainMetadata
          .batch()
          .updateTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txs: fixtures.bitcoin,
          })
          .updateTxs({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            txs: [transaction],
          })
          .commit()

        const expected = {
          asymmetricMatch: (payload: TxLogMap | { value: TxLogMap }) => {
            const txLogs = getObservedTxLogs(payload)

            const expected = createTxSet([...fixtures.bitcoin, transaction])
            return expected.equals(txLogs.exodus_0?.bitcoin ?? TxSet.EMPTY)
          },
        }

        expect(observer).toHaveBeenCalledTimes(2) // initial + update
        expect(observer).toHaveBeenLastCalledWith(expected)
      })
    })
    describe('account states', () => {
      it('should dedupe on remove of the same asset source', async () => {
        await blockchainMetadata.updateAccountState({
          assetName: 'bitcoin',
          walletAccount: 'exodus_0',
          newData: { cursor: '', balance: '2 BTC' },
        })

        const observer = jest.fn()
        accountStatesAtom.observe(observer)

        await blockchainMetadata
          .batch()
          .updateAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            newData: accountState0,
          })
          .removeAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
          })
          .commit()

        expect(observer).toHaveBeenCalledTimes(2) // initial + update
        expect(getLastCallArgs(observer)).toMatchSnapshot()
      })

      it('should dedupe on update of the same asset source', async () => {
        const observer = jest.fn()
        accountStatesAtom.observe(observer)

        await blockchainMetadata
          .batch()
          .updateAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            newData: accountState0,
          })
          .updateAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            newData: accountState1,
          })
          .commit()

        expect(observer).toHaveBeenCalledTimes(2) // initial + update
        expect(getLastCallArgs(observer)).toMatchSnapshot()
      })

      it('should batch updates and emit once', async () => {
        const observer = jest.fn()
        accountStatesAtom.observe(observer)

        await blockchainMetadata
          .batch()
          .updateAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_0',
            newData: accountState0,
          })
          .updateAccountState({
            assetName: 'bitcoin',
            walletAccount: 'exodus_1',
            newData: accountState1,
          })
          .commit()

        await expect(blockchainMetadata.getLoadedAccountStates()).resolves.toEqual({
          exodus_0: {
            bitcoin: AccountStates.bitcoin.deserialize(accountState0),
          },
          exodus_1: {
            bitcoin: AccountStates.bitcoin.deserialize(accountState1),
          },
        })

        expect(observer).toHaveBeenCalledTimes(2) // initial + update
        expect(getLastCallArgs(observer)).toMatchSnapshot()
        await expect(accountStatesAtom.get()).resolves.toMatchSnapshot()
      })
    })
  })
})
