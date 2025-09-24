import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import { keyBy, mapValues, pick, pickBy } from '@exodus/basic-utils'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms/index.js'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module/index.js'
import feeDataAtomDefinition from '@exodus/fee-data-monitors/atoms/fee-data.js'
import { normalizeTxJSON, TxSet, WalletAccount } from '@exodus/models'
import { isSafe } from '@exodus/safe-string'
import createStorage from '@exodus/storage-memory'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms/index.js'

import createBalancesAtom from '../../atoms/balances.js'
import defaultConfig from '../../default-config.js'
import balancesDefinition from '../index.js'
import { assets, createAssetsModuleMock } from './assets-module-mock.js'
import loadFixture from './load-fixture.cjs'

const { factory: createBlockchainMetadata } = blockchainMetadataDefinition
const { factory: createEnabledWalletAccountsAtom } = enabledWalletAccountsAtomDefinition
const { factory: createBalances } = balancesDefinition

const walletAccountInstances = [
  WalletAccount.DEFAULT,
  new WalletAccount({ source: 'exodus', index: 1 }),
]

const txLogAssetFixture = mapValues(loadFixture('tx-log-asset'), (json) =>
  normalizeTxJSON({ json, asset: assets[json.coinName] })
)
const accountStateAssetFixture = mapValues(loadFixture('account-state-asset'), (json) =>
  normalizeTxJSON({ json, asset: assets[json.coinName] })
)

const walletAccountsData = keyBy(walletAccountInstances, (w) => w.toString())

const walletAccountNames = walletAccountInstances.map((w) => w.toString())

let enabledWalletAccountsAtom
let blockchainMetadata
let assetsModule
let availableAssetNamesAtom
let walletAccountsAtom
let storage
let balancesAtom
let txLogsAtom
let feeDataAtom
let accountStatesAtom
let balances

const balanceFieldsConfig = defaultConfig.balanceFieldsConfig

const expectBalances = (actual, expected) => {
  function toObject(walletAccount, assetName, expected) {
    return Object.fromEntries(
      balanceFieldsConfig.flatMap((fieldConfig) => {
        const field = fieldConfig.name
        const expectedBalance = expected.balances[walletAccount]?.[assetName]?.[field]
        const result = [[field, expectedBalance?.toDefaultString({ unit: true })]]
        if (fieldConfig.legacyName) {
          const expectedBalance =
            expected.balances[walletAccount][assetName]?.[fieldConfig.legacyName]
          result.push([fieldConfig.legacyName, expectedBalance?.toDefaultString({ unit: true })])
        }

        return result
      })
    )
  }

  for (const walletAccount in expected.balances) {
    for (const assetName in expected.balances[walletAccount]) {
      const expectedBalances = toObject(walletAccount, assetName, expected)
      const actualBalances = toObject(walletAccount, assetName, actual)

      expect(actualBalances).toEqual(expectedBalances)
    }
  }

  if (expected.changes) expect(actual.changes).toEqual(expected.changes)
}

const defaultAvailableAssetNames = Object.keys(assets)
const createAvailableAssetNamesAtom = () =>
  createInMemoryAtom({
    defaultValue: defaultAvailableAssetNames,
  })

const setupModules = ({ config } = {}) => {
  storage = createStorage()
  assetsModule = createAssetsModuleMock()
  availableAssetNamesAtom = createAvailableAssetNamesAtom()
  walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })
  enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })
  txLogsAtom = txLogsAtomDefinition.factory()
  feeDataAtom = feeDataAtomDefinition.factory()
  accountStatesAtom = accountStatesAtomDefinition.factory()

  blockchainMetadata = createBlockchainMetadata({
    assetsModule,
    enabledWalletAccountsAtom,
    storage: storage.namespace('blockchain'),
    txLogsAtom,
    accountStatesAtom,
  })

  balancesAtom = createBalancesAtom()

  balances = createBalances({
    assetsModule,
    availableAssetNamesAtom,
    enabledWalletAccountsAtom,
    blockchainMetadata,
    config,
    balancesAtom,
    txLogsAtom,
    feeDataAtom,
    accountStatesAtom,
    logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
  })
}

async function initializeModules({ config } = {}) {
  setupModules({ config })
  await blockchainMetadata.load()
  await balances.load()
  await waitUntil({ atom: balancesAtom, predicate: (v) => !!v?.balances })
}

describe('balances module', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('balance is initialized from existing account states on load', async () => {
    const asset = assets.accountStateBasedBalanceAsset
    const walletAccount = walletAccountNames[0]
    const AccountState = asset.api.createAccountState()
    const balance = assets.accountStateBasedBalanceAsset.currency.defaultUnit(1)
    const accountState = AccountState.create({ balance })
    storage = createStorage()
    const blockchainNamespace = storage.namespace('blockchain')
    const accountStateStorage = blockchainNamespace.namespace('states')
    const key = `${walletAccount}:${asset.name}`
    await accountStateStorage.set(key, accountState.toJSON())

    assetsModule = createAssetsModuleMock()
    walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })
    enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })
    txLogsAtom = txLogsAtomDefinition.factory()
    accountStatesAtom = accountStatesAtomDefinition.factory()
    feeDataAtom = feeDataAtomDefinition.factory()

    blockchainMetadata = createBlockchainMetadata({
      assetsModule,
      enabledWalletAccountsAtom,
      storage: blockchainNamespace,
      txLogsAtom,
      accountStatesAtom,
    })

    balancesAtom = createBalancesAtom()
    const handler = jest.fn()
    balancesAtom.observe(handler)

    balances = createBalances({
      assetsModule,
      availableAssetNamesAtom: createAvailableAssetNamesAtom(),
      enabledWalletAccountsAtom,
      blockchainMetadata,
      config: defaultConfig,
      balancesAtom,
      txLogsAtom,
      feeDataAtom,
      accountStatesAtom,
      logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
    })

    balances.load()

    blockchainMetadata.load()

    await waitUntil({ atom: balancesAtom, predicate: (v) => v.balances })

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance,
            total: balance,
            spendable: balance,
            spendableBalance: balance,
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.ZERO,
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
        },
        [walletAccountNames[1]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.ZERO,
            total: assets.accountStateBasedBalanceAsset.currency.ZERO,
            spendable: assets.accountStateBasedBalanceAsset.currency.ZERO,
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
        },
      },
    })
  })

  test('balance updates on asset source accountState update', async () => {
    await initializeModules()
    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
      },
    })

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
          },
        },
      },
      changes: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            total: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            balance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            spendable: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
          },
        },
      },
    })

    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
      },
    })

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
          },
        },
        [walletAccountNames[1]]: {},
      },
      changes: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            total: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            spendable: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
          },
        },
      },
    })

    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.ZERO,
      },
    })

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.ZERO,
            total: assets.accountStateBasedBalanceAsset.currency.ZERO,
            spendable: assets.accountStateBasedBalanceAsset.currency.ZERO,
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
        },
        [walletAccountNames[1]]: {},
      },
      changes: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
              to: assets.accountStateBasedBalanceAsset.currency.ZERO,
            },
            total: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
              to: assets.accountStateBasedBalanceAsset.currency.ZERO,
            },
            spendable: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
              to: assets.accountStateBasedBalanceAsset.currency.ZERO,
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
              to: assets.accountStateBasedBalanceAsset.currency.ZERO,
            },
          },
        },
      },
    })
  })

  test('balance updates across portfolios', async () => {
    await initializeModules()
    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
        total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
      },
    })

    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[1],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
        total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
      },
    })

    await new Promise(setImmediate)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
          },
        },
        [walletAccountNames[1]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
          },
        },
      },
      changes: {
        [walletAccountNames[1]]: {
          accountStateBasedBalanceAsset: {
            balance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            total: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            spendable: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            },
          },
        },
      },
    })
  })

  test('balance includes token balances', async () => {
    await initializeModules()
    // add some tokens on walletAccount 1
    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
        tokenBalances: {
          accountStateBasedBalanceToken:
            assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
        },
      },
    })

    await new Promise(setImmediate)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
          },
          accountStateBasedBalanceToken: {
            balance: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
          },
        },
        [walletAccountNames[1]]: {},
      },
      changes: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            total: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            spendable: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceAsset.currency.ZERO,
              to: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            },
          },
          accountStateBasedBalanceToken: {
            balance: {
              from: assets.accountStateBasedBalanceToken.currency.ZERO,
              to: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            },
            total: {
              from: assets.accountStateBasedBalanceToken.currency.ZERO,
              to: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            },
            spendable: {
              from: assets.accountStateBasedBalanceToken.currency.ZERO,
              to: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            },
            spendableBalance: {
              from: assets.accountStateBasedBalanceToken.currency.ZERO,
              to: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            },
          },
        },
      },
    })
  })

  test('balance updates on changes to walletAccounts', async () => {
    await initializeModules()
    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
      },
    })

    // add some balance on walletAccount 1
    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[1],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
      },
    })

    await new Promise(setImmediate)

    // disable account 1
    walletAccountsAtom.set(pick(walletAccountsData, [WalletAccount.DEFAULT_NAME]))
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
          },
        },
      },
    })

    walletAccountsAtom.set(walletAccountsData)
    await new Promise(setImmediate)
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
          },
        },
        [walletAccountNames[1]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(2),
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.ZERO,
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
        },
      },
    })
  })

  test('balance updates for txLog based assets', async () => {
    await initializeModules()
    const baseAssetTxLog = TxSet.fromArray([
      txLogAssetFixture.baseAssetTxReceivedConfirmed,
      txLogAssetFixture.baseAssetTxReceivedUnconfirmed,
      txLogAssetFixture.baseAssetTxSentConfirmed,
      txLogAssetFixture.baseAssetTxSentUnconfirmed,
      {
        ...txLogAssetFixture.tokenTxSentConfirmed,
        coinName: assets.txLogBasedBalanceAsset.name,
        coinAmount: assets.txLogBasedBalanceAsset.currency.ZERO.toString(),
      },
      {
        ...txLogAssetFixture.tokenTxSentUnconfirmed,
        coinName: assets.txLogBasedBalanceAsset.name,
        coinAmount: assets.txLogBasedBalanceAsset.currency.ZERO.toString(),
      },
    ])

    const tokenTxLog = TxSet.fromArray([
      txLogAssetFixture.tokenTxReceivedUnconfirmed,
      txLogAssetFixture.tokenTxReceivedConfirmed,
      txLogAssetFixture.tokenTxSentUnconfirmed,
      txLogAssetFixture.tokenTxSentConfirmed,
    ])

    const baseAssetTxs = mapValues(accountStateAssetFixture, (tx) => baseAssetTxLog.get(tx.txId))
    const tokenTxs = mapValues(accountStateAssetFixture, (tx) => tokenTxLog.get(tx.txId))

    await blockchainMetadata.updateTxs({
      assetName: assets.txLogBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: baseAssetTxLog.toJSON(),
    })

    const txLogBasedAssets = pickBy(
      assetsModule.getAssets(),
      (asset) => asset.api?.features?.historyBasedBalance
    )

    assetsModule.getAssets = () => txLogBasedAssets

    const baseAssetExpectedBalance = baseAssetTxLog.getMutations().slice(-1)[0].balance
    const baseAssetExpectedSpendableBalance = baseAssetExpectedBalance
      // note: coinAmount is positive for receives and negative for sends
      .sub(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
      .sub(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
      // note: feeAmount is ALWAYS positive (for now)
      .add(tokenTxs.tokenTxSentUnconfirmed.feeAmount)

    await new Promise(setImmediate)
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          txLogBasedBalanceAsset: {
            balance: baseAssetExpectedBalance,
            total: baseAssetExpectedBalance,
            spendable: baseAssetExpectedSpendableBalance,
            spendableBalance: baseAssetExpectedSpendableBalance,
          },
        },
      },
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.txLogBasedBalanceToken.name,
      walletAccount: walletAccountNames[0],
      txs: tokenTxLog.toJSON(),
    })

    const tokenExpectedBalance = tokenTxLog.getMutations().slice(-1)[0].balance
    const tokenExpectedSpendableBalance = tokenExpectedBalance
      // note: coinAmount is positive for receives and negative for sends
      .sub(tokenTxs.tokenTxSentUnconfirmed.coinAmount)
      .sub(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
    await new Promise(setImmediate)
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          txLogBasedBalanceAsset: {
            balance: baseAssetExpectedBalance,
            total: baseAssetExpectedBalance,
            spendable: baseAssetExpectedSpendableBalance,
            spendableBalance: baseAssetExpectedSpendableBalance,
          },
          txLogBasedBalanceToken: {
            balance: tokenExpectedBalance,
            total: tokenExpectedBalance,
            spendable: tokenExpectedSpendableBalance,
            spendableBalance: tokenExpectedSpendableBalance,
          },
        },
      },
    })

    // TODO: test tokens that are accountState based (see isRpcBalanceAsset)
    // updatePromise = awaitEvent(balancesModule, 'balances')
    // blockchainMetadata.emit('account-state', {
    //   assetName: assets.bsc.name,
    //   walletAccount: walletAccountNames[0],
    //   accountState: {
    //     bsc: assets.bsc.currency.defaultUnit(1),
    //   },
    // })

    // expectBalances(await updatePromise, {
    //   balances: {
    //     [walletAccountNames[0]]: {
    //       txLogBasedBalanceAsset: {
    //         balance: assets.txLogBasedBalanceAsset.currency.defaultUnit(1),
    //       },
    //       txLogBasedBalanceToken: {
    //         balance: assets.txLogBasedBalanceToken.currency.defaultUnit(12),
    //       },
    //       bsc: {
    //         balance: assets.bsc.currency.defaultUnit(1),
    //       },
    //     },
    //   },
    // })
  })

  test('balance updates on changes to assets', async () => {
    await initializeModules()
    blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
        total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
        tokenBalances: {
          accountStateBasedBalanceToken:
            assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
        },
      },
    })

    assetsModule.getAssets = () => ({
      accountStateBasedBalanceAsset: assets.accountStateBasedBalanceAsset,
    })
    // never do this in production code, only the assets module is allowed the honor
    await availableAssetNamesAtom.set((names) => [...names, 'waynecoin'])

    await new Promise(setImmediate)
    const actualBalances = await balancesAtom.get()
    expectBalances(actualBalances, {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.defaultUnit(0),
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.defaultUnit(0),
          },
          accountStateBasedBalanceToken: {
            balance: undefined,
            total: undefined,
          },
        },
      },
    })

    assetsModule.getAssets = () => ({
      accountStateBasedBalanceAsset: assets.accountStateBasedBalanceAsset,
      accountStateBasedBalanceToken: assets.accountStateBasedBalanceToken,
    })

    // never do this in production code, only the assets module is allowed the honor
    await availableAssetNamesAtom.set((names) => [...names, 'othercoin'])
    await new Promise(setImmediate)
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceAsset.currency.defaultUnit(1),
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.ZERO,
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
          accountStateBasedBalanceToken: {
            balance: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            total: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            spendable: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
            spendableBalance: assets.accountStateBasedBalanceToken.currency.defaultUnit(1),
          },
        },
      },
    })
  })

  test('balance for txLog tokens persists on recompute', async () => {
    await initializeModules()
    await blockchainMetadata.updateTxs({
      assetName: assets.txLogBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: TxSet.fromArray([txLogAssetFixture.baseAssetTxReceivedConfirmed]).toJSON(),
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.txLogBasedBalanceToken.name,
      walletAccount: walletAccountNames[0],
      txs: TxSet.fromArray([txLogAssetFixture.tokenTxReceivedConfirmed]).toJSON(),
    })

    const result = {
      balances: {
        [walletAccountNames[0]]: {
          txLogBasedBalanceAsset: {
            balance: assets.txLogBasedBalanceAsset.currency.defaultUnit(1),
            total: assets.txLogBasedBalanceAsset.currency.defaultUnit(1),
            spendable: assets.txLogBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: assets.txLogBasedBalanceAsset.currency.defaultUnit(1),
          },
          txLogBasedBalanceToken: {
            balance: assets.txLogBasedBalanceToken.currency.defaultUnit(12),
            total: assets.txLogBasedBalanceToken.currency.defaultUnit(12),
            spendable: assets.txLogBasedBalanceToken.currency.defaultUnit(12),
            spendableBalance: assets.txLogBasedBalanceToken.currency.defaultUnit(12),
          },
        },
      },
    }
    const spy = jest.spyOn(balancesAtom, 'set')
    await new Promise(setImmediate)
    expect(spy).toBeCalledTimes(1)
    // force recompute
    await availableAssetNamesAtom.set((names) => [...names, 'waynecoin'])
    await new Promise(setImmediate)
    expect(spy).toBeCalledTimes(2)
    expectBalances(await balancesAtom.get(), result)
  })

  test('confirmedBalance for accountState-based assets', async () => {
    await initializeModules()
    const baseAssetTxLog = TxSet.fromArray([
      accountStateAssetFixture.baseAssetTxReceivedUnconfirmed,
      accountStateAssetFixture.baseAssetTxReceivedConfirmed,
      accountStateAssetFixture.baseAssetTxSentConfirmed,
      accountStateAssetFixture.baseAssetTxSentUnconfirmed,
      {
        ...accountStateAssetFixture.tokenTxSentConfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
      {
        ...accountStateAssetFixture.tokenTxSentUnconfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
    ])

    const tokenTxLog = TxSet.fromArray([
      accountStateAssetFixture.tokenTxReceivedUnconfirmed,
      accountStateAssetFixture.tokenTxReceivedConfirmed,
      accountStateAssetFixture.tokenTxSentConfirmed,
      accountStateAssetFixture.tokenTxSentUnconfirmed,
    ])

    const baseAssetTxs = mapValues(accountStateAssetFixture, (tx) => baseAssetTxLog.get(tx.txId))
    const tokenTxs = mapValues(accountStateAssetFixture, (tx) => tokenTxLog.get(tx.txId))

    const baseAssetBalanceFromAccountState =
      assets.accountStateBasedBalanceAsset.currency.defaultUnit(5)

    // conceptually:
    // const baseAssetBalanceFromAccountState = baseAssetTxs.baseAssetTxReceivedConfirmed.coinAmount
    //   .add(baseAssetTxs.baseAssetTxSentConfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
    //   .sub(tokenTxs.tokenTxSentUnconfirmed.feeAmount)
    //   .sub(tokenTxs.tokenTxSentConfirmed.feeAmount)

    const tokenBalanceFromAccountState =
      assets.accountStateBasedBalanceToken.currency.defaultUnit(20)

    // conceptually:
    // const tokenBalanceFromAccountState = tokenTxs.tokenTxReceivedConfirmed.coinAmount
    //   .add(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentConfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: baseAssetBalanceFromAccountState,
        tokenBalances: {
          accountStateBasedBalanceToken: tokenBalanceFromAccountState,
        },
      },
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: baseAssetTxLog.toJSON(),
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceToken.name,
      walletAccount: walletAccountNames[0],
      txs: tokenTxLog.toJSON(),
    })

    // const baseAssetTxs = mapValues(fixture, (tx) => baseAssetTxLog.get(tx.txId))
    // const tokenTxs = mapValues(fixture, (tx) => tokenTxLog.get(tx.txId))
    await new Promise(setImmediate)

    const spendableBalance = baseAssetBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
      .sub(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
      // note: feeAmount is ALWAYS positive (for now)
      .add(tokenTxs.tokenTxSentUnconfirmed.feeAmount)

    const spendableBalanceToken = tokenBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
      .sub(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    const result = {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: baseAssetBalanceFromAccountState,
            total: baseAssetBalanceFromAccountState,
            spendableBalance,
            spendable: spendableBalance,
          },
          accountStateBasedBalanceToken: {
            balance: tokenBalanceFromAccountState,
            total: tokenBalanceFromAccountState,
            spendableBalance: spendableBalanceToken,
            spendable: spendableBalanceToken,
          },
        },
      },
    }

    expectBalances(await balancesAtom.get(), result)

    // force recompute
    availableAssetNamesAtom.set((names) => [...names, 'waynecoin'])
    await new Promise(setImmediate)

    // Since on first recompute balance is zero unconfirmedReceived is not returned. with updates we also ignore `changes` with unconfirmedReceived since it's zero
    // but this second recompute forces to set zero balance for unconfirmedReceived according this logic features/balances/module/__tests__/assets-module-mock.js:62
    // but anyway balances are the same except this issue
    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: baseAssetBalanceFromAccountState,
            total: baseAssetBalanceFromAccountState,
            spendableBalance,
            spendable: spendableBalance,
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.ZERO,
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
          accountStateBasedBalanceToken: {
            balance: tokenBalanceFromAccountState,
            total: tokenBalanceFromAccountState,
            spendableBalance: spendableBalanceToken,
            spendable: spendableBalanceToken,
          },
        },
      },
    })
  })

  test('spendableBalance for accountState-based assets', async () => {
    await initializeModules()
    const spy = jest.spyOn(balancesAtom, 'set')

    const baseAssetTxLog = TxSet.fromArray([
      accountStateAssetFixture.baseAssetTxReceivedUnconfirmed,
      accountStateAssetFixture.baseAssetTxReceivedConfirmed,
      accountStateAssetFixture.baseAssetTxSentConfirmed,
      accountStateAssetFixture.baseAssetTxSentUnconfirmed,
      {
        ...accountStateAssetFixture.tokenTxSentConfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
      {
        ...accountStateAssetFixture.tokenTxSentUnconfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
    ])

    const tokenTxLog = TxSet.fromArray([
      accountStateAssetFixture.tokenTxReceivedUnconfirmed,
      accountStateAssetFixture.tokenTxReceivedConfirmed,
      accountStateAssetFixture.tokenTxSentConfirmed,
      accountStateAssetFixture.tokenTxSentUnconfirmed,
    ])

    const baseAssetTxs = mapValues(accountStateAssetFixture, (tx) => baseAssetTxLog.get(tx.txId))
    const tokenTxs = mapValues(accountStateAssetFixture, (tx) => tokenTxLog.get(tx.txId))

    const baseAssetBalanceFromAccountState =
      assets.accountStateBasedBalanceAsset.currency.defaultUnit(5)

    // conceptually:
    // const baseAssetBalanceFromAccountState = baseAssetTxs.baseAssetTxReceivedConfirmed.coinAmount
    //   .add(baseAssetTxs.baseAssetTxSentConfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
    //   .sub(tokenTxs.tokenTxSentUnconfirmed.feeAmount)
    //   .sub(tokenTxs.tokenTxSentConfirmed.feeAmount)

    const tokenBalanceFromAccountState =
      assets.accountStateBasedBalanceToken.currency.defaultUnit(20)

    // conceptually:
    // const tokenBalanceFromAccountState = tokenTxs.tokenTxReceivedConfirmed.coinAmount
    //   .add(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentConfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: baseAssetBalanceFromAccountState,
        tokenBalances: {
          accountStateBasedBalanceToken: tokenBalanceFromAccountState,
        },
      },
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: baseAssetTxLog.toJSON(),
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceToken.name,
      walletAccount: walletAccountNames[0],
      txs: tokenTxLog.toJSON(),
    })

    expect(spy).toBeCalledTimes(2)
    // force recompute
    availableAssetNamesAtom.set((names) => [...names, 'waynecoin'])

    // const baseAssetTxs = mapValues(fixture, (tx) => baseAssetTxLog.get(tx.txId))
    // const tokenTxs = mapValues(fixture, (tx) => tokenTxLog.get(tx.txId))
    await new Promise(setImmediate)
    expect(spy).toBeCalledTimes(4)
    const accountSpendableBalance = baseAssetBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
      .sub(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
      // note: feeAmount is ALWAYS positive (for now)
      .add(tokenTxs.tokenTxSentUnconfirmed.feeAmount)

    const tokenSpendableBalance = tokenBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
      .sub(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: baseAssetBalanceFromAccountState,
            total: baseAssetBalanceFromAccountState,
            spendableBalance: accountSpendableBalance,
            spendable: accountSpendableBalance,
            unconfirmedReceived: assets.accountStateBasedBalanceAsset.currency.ZERO,
            unconfirmedSent: assets.accountStateBasedBalanceAsset.currency.ZERO,
          },
          accountStateBasedBalanceToken: {
            balance: tokenBalanceFromAccountState,
            total: tokenBalanceFromAccountState,
            spendableBalance: tokenSpendableBalance,
            spendable: tokenSpendableBalance,
          },
        },
      },
    })
  })

  test('should call get balances with fee data', async () => {
    await initializeModules()
    const { accountStateBasedBalanceAsset, txLogBasedBalanceAsset } = assets

    const accountStateBalance = accountStateBasedBalanceAsset.currency.baseUnit(100)
    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: accountStateBalance,
      },
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.txLogBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: TxSet.fromArray([txLogAssetFixture.baseAssetTxReceivedConfirmed]).toJSON(),
    })

    await new Promise(setImmediate)

    const txLogBalance = txLogBasedBalanceAsset.currency.defaultUnit(1)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: accountStateBalance,
            total: accountStateBalance,
            spendable: accountStateBalance,
            spendableBalance: accountStateBalance,
          },
          txLogBasedBalanceAsset: {
            balance: txLogBalance,
            total: txLogBalance,
            spendable: txLogBalance,
            spendableBalance: txLogBalance,
          },
        },
      },
    })

    await feeDataAtom.set({ accountStateBasedBalanceAsset: { addToSpendableBalance: 546 } }) // ignored
    await feeDataAtom.set({ txLogBasedBalanceAsset: { addToSpendableBalance: 123 } })
    await new Promise(setImmediate)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            balance: accountStateBalance,
            total: accountStateBalance,
            spendable: accountStateBalance,
            spendableBalance: accountStateBalance,
          },
          txLogBasedBalanceAsset: {
            balance: txLogBalance,
            total: txLogBalance,
            spendable: txLogBalance.add(txLogBasedBalanceAsset.currency.baseUnit(123)),
            spendableBalance: txLogBalance.add(txLogBasedBalanceAsset.currency.baseUnit(123)),
          },
        },
      },
    })
  })

  test('spendableBalance for accountState-based assets with balance fields subset', async () => {
    await initializeModules({ config: { balanceFields: ['total', 'spendable'] } })
    const baseAssetTxLog = TxSet.fromArray([
      accountStateAssetFixture.baseAssetTxReceivedUnconfirmed,
      accountStateAssetFixture.baseAssetTxReceivedConfirmed,
      accountStateAssetFixture.baseAssetTxSentConfirmed,
      accountStateAssetFixture.baseAssetTxSentUnconfirmed,
      {
        ...accountStateAssetFixture.tokenTxSentConfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
      {
        ...accountStateAssetFixture.tokenTxSentUnconfirmed,
        coinName: assets.accountStateBasedBalanceAsset.name,
        coinAmount: assets.accountStateBasedBalanceAsset.currency.ZERO.toString(),
      },
    ])

    const tokenTxLog = TxSet.fromArray([
      accountStateAssetFixture.tokenTxReceivedUnconfirmed,
      accountStateAssetFixture.tokenTxReceivedConfirmed,
      accountStateAssetFixture.tokenTxSentConfirmed,
      accountStateAssetFixture.tokenTxSentUnconfirmed,
    ])

    const baseAssetTxs = mapValues(accountStateAssetFixture, (tx) => baseAssetTxLog.get(tx.txId))
    const tokenTxs = mapValues(accountStateAssetFixture, (tx) => tokenTxLog.get(tx.txId))

    const baseAssetBalanceFromAccountState =
      assets.accountStateBasedBalanceAsset.currency.defaultUnit(5)

    // conceptually:
    // const baseAssetBalanceFromAccountState = baseAssetTxs.baseAssetTxReceivedConfirmed.coinAmount
    //   .add(baseAssetTxs.baseAssetTxSentConfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
    //   .add(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
    //   .sub(tokenTxs.tokenTxSentUnconfirmed.feeAmount)
    //   .sub(tokenTxs.tokenTxSentConfirmed.feeAmount)

    const tokenBalanceFromAccountState =
      assets.accountStateBasedBalanceToken.currency.defaultUnit(20)

    // conceptually:
    // const tokenBalanceFromAccountState = tokenTxs.tokenTxReceivedConfirmed.coinAmount
    //   .add(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentConfirmed.coinAmount)
    //   .add(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    await blockchainMetadata.updateAccountState({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: baseAssetBalanceFromAccountState,
        tokenBalances: {
          accountStateBasedBalanceToken: tokenBalanceFromAccountState,
        },
      },
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceAsset.name,
      walletAccount: walletAccountNames[0],
      txs: baseAssetTxLog.toJSON(),
    })

    await blockchainMetadata.updateTxs({
      assetName: assets.accountStateBasedBalanceToken.name,
      walletAccount: walletAccountNames[0],
      txs: tokenTxLog.toJSON(),
    })

    // force recompute
    availableAssetNamesAtom.set((names) => [...names, 'waynecoin'])

    // const baseAssetTxs = mapValues(fixture, (tx) => baseAssetTxLog.get(tx.txId))
    // const tokenTxs = mapValues(fixture, (tx) => tokenTxLog.get(tx.txId))
    await new Promise(setImmediate)
    const accountSpendableBalance = baseAssetBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(baseAssetTxs.baseAssetTxReceivedUnconfirmed.coinAmount)
      .sub(baseAssetTxs.baseAssetTxSentUnconfirmed.coinAmount)
      // note: feeAmount is ALWAYS positive (for now)
      .add(tokenTxs.tokenTxSentUnconfirmed.feeAmount)

    const tokenSpendableBalance = tokenBalanceFromAccountState
      // note: coinAmount is positive for receives and negative for sends
      .sub(tokenTxs.tokenTxReceivedUnconfirmed.coinAmount)
      .sub(tokenTxs.tokenTxSentUnconfirmed.coinAmount)

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          accountStateBasedBalanceAsset: {
            total: baseAssetBalanceFromAccountState,
            spendable: accountSpendableBalance,
          },
          accountStateBasedBalanceToken: {
            total: tokenBalanceFromAccountState,
            spendable: tokenSpendableBalance,
          },
        },
      },
    })
  })

  test('walletAccount balance calculation survives failure of individual asset balance calculations', async () => {
    const { accountStateBasedBalanceAsset, txLogBasedBalanceAsset } = assets
    const walletAccount = walletAccountNames[0]
    const AccountState = accountStateBasedBalanceAsset.api.createAccountState()
    const accountState = AccountState.create({
      balance: accountStateBasedBalanceAsset.currency.defaultUnit(1),
    })

    storage = createStorage()
    const blockchainNamespace = storage.namespace('blockchain')
    const accountStateStorage = blockchainNamespace.namespace('states')
    await accountStateStorage.set(
      `${walletAccount}:${accountStateBasedBalanceAsset.name}`,
      accountState.toJSON()
    )

    const txLogsStorage = blockchainNamespace.namespace('txs')
    await txLogsStorage.set(
      `${walletAccount}:${txLogBasedBalanceAsset.name}`,
      TxSet.fromArray([txLogAssetFixture.baseAssetTxReceivedConfirmed]).toJSON()
    )

    assetsModule = createAssetsModuleMock()
    walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })
    enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })
    txLogsAtom = txLogsAtomDefinition.factory()
    accountStatesAtom = accountStatesAtomDefinition.factory()
    feeDataAtom = feeDataAtomDefinition.factory()

    blockchainMetadata = createBlockchainMetadata({
      assetsModule,
      enabledWalletAccountsAtom,
      storage: blockchainNamespace,
      txLogsAtom,
      accountStatesAtom,
    })

    balancesAtom = createBalancesAtom()
    const handler = jest.fn()
    balancesAtom.observe(handler)

    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }
    const errorTracking = { track: jest.fn() }

    const balancesModule = createBalances({
      assetsModule,
      availableAssetNamesAtom: createAvailableAssetNamesAtom(),
      enabledWalletAccountsAtom,
      blockchainMetadata,
      balancesAtom,
      txLogsAtom,
      feeDataAtom,
      accountStatesAtom,
      errorTracking,
      logger,
    })
    balancesModule.load()

    jest.spyOn(accountStateBasedBalanceAsset.api, 'getBalances').mockImplementation(() => {
      throw new Error('boo!')
    })

    blockchainMetadata.load()

    await waitUntil({ atom: balancesAtom, predicate: (v) => v.balances })

    expectBalances(await balancesAtom.get(), {
      balances: {
        [walletAccountNames[0]]: {
          txLogBasedBalanceAsset: {
            balance: txLogBasedBalanceAsset.currency.defaultUnit(1),
            total: txLogBasedBalanceAsset.currency.defaultUnit(1),
            spendable: txLogBasedBalanceAsset.currency.defaultUnit(1),
            spendableBalance: txLogBasedBalanceAsset.currency.defaultUnit(1),
          },
        },
      },
    })

    expect(errorTracking.track).toHaveBeenCalledWith({
      error: new Error('getBalancesForAssetSource'),
    })

    expect(isSafe('getBalancesForAssetSource')).toBe(true)
  })
})
