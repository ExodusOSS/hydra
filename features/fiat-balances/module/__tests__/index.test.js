import { connectAssetsList } from '@exodus/assets'
import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import createBalancesAtom from '@exodus/balances/atoms/balances'
import balancesDefinition from '@exodus/balances/module'
import { keyBy, omit, pick } from '@exodus/basic-utils'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module'
import { AccountState, WalletAccount } from '@exodus/models'
import assetsList from '@exodus/solana-meta'
import createStorage from '@exodus/storage-memory'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms'
import EventEmitter from 'events/'

import createFiatBalancesAtom from '../../atoms/fiat-balances'
import fiatBalancesDefinition from '../'

const _assets = connectAssetsList(assetsList)

const { factory: createEnabledWalletAccountsAtom } = enabledWalletAccountsAtomDefinition
const { factory: createBalances } = balancesDefinition
const { factory: createFiatBalances } = fiatBalancesDefinition
const { factory: createBlockchainMetadata } = blockchainMetadataDefinition

const assets = {
  solana: {
    ..._assets.solana,
    api: {
      ..._assets.solana.api,
      getBalances: ({ accountState }) => pick(accountState, ['balance']),
      hasFeature: () => false,
      createAccountState: () => SolanaTestAccountState,
    },
  },
  raydium: {
    ..._assets.raydium,
    api: {
      ..._assets.raydium.api,
      getBalances: ({ accountState }) => ({
        balance: accountState.tokenBalances.raydium,
      }),
      hasFeature: () => false,
    },
  },
}

const defaultAvailableAssetNames = Object.keys(assets)
const createAvailableAssetNamesAtom = () =>
  createInMemoryAtom({
    defaultValue: defaultAvailableAssetNames,
  })

class SolanaTestAccountState extends AccountState {
  static defaults = {
    cursor: '',
    balance: assets.solana.currency.ZERO,
    tokenBalances: {},
  }
}

const createAssetsModule = () =>
  Object.assign(new EventEmitter(), {
    getAssets: () => assets,
    getAsset: (assetName) => assets[assetName],
    getBaseAssetNames: () => ['solana'],
    getTokenNames: () => ['raydium'],
  })

const walletAccountInstances = [
  WalletAccount.DEFAULT,
  new WalletAccount({ source: 'exodus', index: 1 }),
]

const walletAccountsData = keyBy(walletAccountInstances, (w) => w.toString())

const walletAccountNames = walletAccountInstances.map((w) => w.toString())

let walletAccountsAtom
let blockchainMetadata
let assetsModule
let fiatBalancesModule
let ratesAtom
let currencyAtom
let balancesAtom
let fiatBalancesAtom
let txLogsAtom
let accountStatesAtom
let balances

const defaultRates = {
  RAY: {
    price: 10,
    priceUSD: 1,
  },
  SOL: {
    price: 500,
    priceUSD: 50,
  },
}

const initialRates = {
  USD: { ...defaultRates },
}

const setupModules = async ({ balanceFields, fiatBalanceFields }) => {
  const storage = createStorage()
  assetsModule = createAssetsModule()
  fiatBalancesAtom = createFiatBalancesAtom()
  txLogsAtom = txLogsAtomDefinition.factory()
  accountStatesAtom = accountStatesAtomDefinition.factory()

  walletAccountsAtom = createInMemoryAtom({
    defaultValue: walletAccountsData,
  })

  const enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })

  blockchainMetadata = createBlockchainMetadata({
    assetsModule,
    enabledWalletAccountsAtom,
    storage: storage.namespace('blockchain-metadata'),
    txLogsAtom,
    accountStatesAtom,
  })

  blockchainMetadata.load()
  balancesAtom = createBalancesAtom()
  balances = createBalances({
    assetsModule,
    availableAssetNamesAtom: createAvailableAssetNamesAtom(),
    enabledWalletAccountsAtom,
    blockchainMetadata,
    config: { balanceFields },
    balancesAtom,
    txLogsAtom,
    accountStatesAtom,
    logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
  })
  await balances.load()
  await waitUntil({
    atom: balancesAtom,
    predicate: (v) => {
      return v.balances
    },
  })

  ratesAtom = createInMemoryAtom()
  currencyAtom = createInMemoryAtom({ defaultValue: 'USD' })
  fiatBalancesModule = createFiatBalances({
    assetsModule,
    balancesAtom,
    config: { balanceFields: fiatBalanceFields },
    ratesAtom,
    currencyAtom,
    fiatBalancesAtom,
    logger: { log: jest.fn() },
  })
}

const init = async ({ balanceFields, fiatBalanceFields }) => {
  await setupModules({ balanceFields, fiatBalanceFields })

  await ratesAtom.set(initialRates)

  fiatBalancesModule.load()
  // initial ready
  await waitUntil({ atom: fiatBalancesAtom, predicate: (v) => !!v?.balances })
  return fiatBalancesModule
}

const checkSnapshot = async () => {
  await new Promise(setImmediate)
  const result = await fiatBalancesAtom.get()
  expect(result.balances).toMatchSnapshot()
}

describe('fiat-balances', () => {
  test('balance updates on asset source accountState update', async () => {
    init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(1),
      },
    })

    await checkSnapshot()

    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(2),
      },
    })

    await checkSnapshot()
  })

  test('balance updates across portfolios', async () => {
    init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(1),
      },
    })

    await checkSnapshot()

    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[1],
      newData: {
        balance: assets.solana.currency.defaultUnit(2),
      },
    })

    await checkSnapshot()
  })

  test('balance updates on changes to walletAccounts', async () => {
    init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(1),
      },
    })

    await checkSnapshot()

    // add some balance on walletAccount 1
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[1],
      newData: {
        balance: assets.solana.currency.defaultUnit(2),
      },
    })

    await checkSnapshot()

    walletAccountsAtom.set(omit(walletAccountsData, ['exodus_1']))
    await checkSnapshot()
    walletAccountsAtom.set(walletAccountsData)
    await checkSnapshot()
  })

  test('balance updates on change in rates', async () => {
    init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(1),
      },
    })

    // ignore first update
    await checkSnapshot()

    await ratesAtom.set({
      USD: {
        RAY: {
          price: 20,
          priceUSD: 2,
        },
        SOL: {
          price: 1000,
          priceUSD: 100,
        },
      },
    })

    await checkSnapshot()
  })

  test('balance updates on change in fiatCurrency', async () => {
    await init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })
    blockchainMetadata.updateAccountState({
      assetName: assets.solana.name,
      walletAccount: walletAccountNames[0],
      newData: {
        balance: assets.solana.currency.defaultUnit(1),
      },
    })

    await currencyAtom.set('CNY')
    await ratesAtom.set({
      CNY: { ...defaultRates },
    })

    await checkSnapshot()
  })

  test('subset of balance fields update', async () => {
    await init({
      balanceFields: ['balance', 'confirmedBalance'],
      fiatBalanceFields: ['balance'],
    })

    const initialBalances = {
      exodus_0: {
        solana: {
          balance: assets.solana.currency.defaultUnit(2),
          confirmedBalance: assets.solana.currency.defaultUnit(2),
        },
      },
    }

    await balancesAtom.set({
      balances: initialBalances,
      changes: {
        exodus_0: {
          solana: {
            confirmedBalance: {
              from: assets.solana.currency.defaultUnit(2),
              to: assets.solana.currency.defaultUnit(1),
            },
          },
        },
      },
    })

    await balancesAtom.set({
      balances: {
        exodus_0: {
          solana: {
            balance: assets.solana.currency.defaultUnit(2),
            confirmedBalance: assets.solana.currency.defaultUnit(1),
          },
        },
      },
      changes: {
        exodus_0: {
          solana: {
            confirmedBalance: {
              from: assets.solana.currency.defaultUnit(2),
              to: assets.solana.currency.defaultUnit(1),
            },
          },
        },
      },
    })

    await checkSnapshot()
  })

  test('adding walletAccounts', async () => {
    await init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })

    const initialBalances = {
      exodus_0: {
        solana: {
          balance: assets.solana.currency.defaultUnit(1),
        },
      },
    }

    await balancesAtom.set({ balances: initialBalances })

    await balancesAtom.set({
      changes: {
        exodus_1: {
          solana: {
            balance: {
              from: assets.solana.currency.defaultUnit(0),
              to: assets.solana.currency.defaultUnit(2),
            },
          },
        },
      },
      balances: {
        ...initialBalances,
        exodus_1: {
          solana: {
            balance: assets.solana.currency.defaultUnit(2),
          },
        },
      },
    })

    await checkSnapshot()
  })

  test('removing walletAccounts', async () => {
    await init({
      balanceFields: ['balance'],
      fiatBalanceFields: ['balance'],
    })

    const initialBalances = {
      exodus_0: {
        solana: {
          balance: assets.solana.currency.defaultUnit(1),
        },
      },
      exodus_1: {
        solana: {
          balance: assets.solana.currency.defaultUnit(2),
        },
      },
    }

    await balancesAtom.set({ balances: initialBalances })

    await balancesAtom.set({
      changes: {
        exodus_1: {
          solana: {
            balance: {
              from: assets.solana.currency.defaultUnit(2),
              to: assets.solana.currency.defaultUnit(0),
            },
          },
        },
      },
      balances: {
        exodus_0: initialBalances.exodus_0,
      },
    })

    await checkSnapshot()
  })

  test('balancesAtom loaded with changes field before fiat balances loaded', async () => {
    await setupModules({ balanceFields: ['balance'], fiatBalanceFields: ['balance'] })

    await ratesAtom.set(initialRates)

    await balancesAtom.set({
      changes: {
        exodus_1: {
          solana: {
            balance: {
              from: assets.solana.currency.defaultUnit(2),
              to: assets.solana.currency.defaultUnit(0),
            },
          },
        },
      },
      balances: {
        exodus_0: {
          raydium: {
            balance: assets.raydium.currency.defaultUnit(10),
          },
          solana: {
            balance: assets.solana.currency.defaultUnit(1),
          },
        },
        exodus_1: {
          solana: {
            balance: assets.solana.currency.defaultUnit(0),
          },
        },
      },
    })

    await fiatBalancesModule.load()

    await checkSnapshot()
  })
})
