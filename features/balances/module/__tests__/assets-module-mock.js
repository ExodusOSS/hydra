import { intersection, pick } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'
import { AccountState, TxSet } from '@exodus/models'
import EventEmitter from 'events/events.js'

const isUnconfirmedTx = (tx) => tx.pending && !tx.error

const getTxSetBalance = (txSet) => txSet.getMutations().slice(-1)[0].balance

const getUnconfirmedTotal = ({ asset, txLog }) => {
  const unconfirmedTxs = [...txLog].filter(isUnconfirmedTx)
  return unconfirmedTxs.length === 0
    ? asset.currency.ZERO
    : getTxSetBalance(TxSet.fromArray(unconfirmedTxs))
}

const getSpendableBalance = ({ asset, txLog, balance }) => {
  if (!balance) {
    return
  }

  const unconfirmedTotal = getUnconfirmedTotal({ asset, txLog })
  return balance.sub(unconfirmedTotal)
}

const getBalances = ({ asset, txLog, feeData }) => {
  const balance = txLog.getMutations().slice(-1)[0]?.balance ?? asset.currency.ZERO
  const spendableBalance = getSpendableBalance({ asset, txLog, balance })
  return balance
    ? {
        balance,
        spendableBalance: feeData?.addToSpendableBalance
          ? spendableBalance.add(asset.currency.baseUnit(feeData?.addToSpendableBalance))
          : spendableBalance,
      }
    : null
}

const accountStateBasedBalanceAsset = {
  name: 'accountStateBasedBalanceAsset',
  get baseAsset() {
    return accountStateBasedBalanceAsset
  },
  get feeAsset() {
    return accountStateBasedBalanceAsset
  },
  currency: UnitType.create({
    Lamports: 0,
    SOL: 9,
  }),
  api: {
    hasFeature: (feature) => ({})[feature],
    getBalances: ({ accountState, txLog, asset, feeData }) => {
      if (feeData) {
        throw new Error('Fee data is not expected here!')
      }

      const { balance } = pick(accountState, ['balance'])
      const spendableBalance = getSpendableBalance({ asset, txLog, balance })
      const unconfirmedSent = UnitType.create({
        invalid: 0,
        INV: 9,
      }).defaultUnit(2) // check exception handling

      const unconfirmedReceived = asset.currency.defaultUnit(-3) // check exception handling

      if (balance && !balance.isZero) {
        return { balance, spendableBalance, unconfirmedSent, unconfirmedReceived }
      }

      return null
    },
    createAccountState: () => AccountState0,
  },
}

class AccountState0 extends AccountState {
  static defaults = {
    cursor: '',
    balance: accountStateBasedBalanceAsset.currency.ZERO,
    tokenBalances: {},
  }
}

const assetMocks = {
  accountStateBasedBalanceAsset,
  accountStateBasedBalanceToken: {
    name: 'accountStateBasedBalanceToken',
    get baseAsset() {
      return assetMocks.accountStateBasedBalanceAsset
    },
    get feeAsset() {
      return assetMocks.accountStateBasedBalanceAsset
    },
    currency: UnitType.create({
      base: 0,
      SRM: 6,
    }),
    api: {
      hasFeature: (feature) => ({})[feature],
      getBalances: ({ asset, txLog, accountState, feeData }) => {
        if (feeData) {
          throw new Error('Fee data is not expected here!')
        }

        const balance = accountState?.tokenBalances?.accountStateBasedBalanceToken
        const spendableBalance = getSpendableBalance({ asset, txLog, balance })
        return balance ? { balance, spendableBalance } : null
      },
    },
  },
  txLogBasedBalanceAsset: {
    name: 'txLogBasedBalanceAsset',
    get baseAsset() {
      return assetMocks.txLogBasedBalanceAsset
    },
    get feeAsset() {
      return assetMocks.txLogBasedBalanceAsset
    },
    currency: UnitType.create({
      wei: 0,
      Kwei: 3,
      Mwei: 6,
      Gwei: 9,
      szabo: 12,
      finney: 15,
      ETH: 18,
    }),
    api: {
      features: { historyBasedBalance: true, balancesRequireFeeData: true },
      getBalances,
    },
  },
  txLogBasedBalanceToken: {
    name: 'txLogBasedBalanceToken',
    get baseAsset() {
      return assetMocks.txLogBasedBalanceAsset
    },
    get feeAsset() {
      return assetMocks.txLogBasedBalanceAsset
    },
    currency: UnitType.create({
      base: 0,
      DAI: 18,
    }),
    api: {
      features: { historyBasedBalance: true },
      getBalances,
    },
  },
  madeUpCombinedAsset: {
    name: 'madeUpCombinedAsset',
    get baseAsset() {
      return assetMocks.madeUpCombinedAsset
    },
    api: {
      hasFeature: (feature) => ({})[feature],
    },
    isCombined: true,
  },
}

export const createAssetsModuleMock = () => {
  const mock = new EventEmitter()
  return Object.assign(mock, {
    getAssets: () => assetMocks,
    getAsset: (assetName) => mock.getAssets()[assetName],
    getTokenNames: (assetName) => {
      const tokens =
        assetName === 'accountStateBasedBalanceAsset'
          ? ['accountStateBasedBalanceToken']
          : assetName === 'txLogBasedBalanceAsset'
            ? ['txLogBasedBalanceToken']
            : []

      return intersection(Object.keys(mock.getAssets()), tokens)
    },
    // filter out unavailable assets
    getBaseAssetNames: () =>
      intersection(Object.keys(mock.getAssets()), [
        'accountStateBasedBalanceAsset',
        'txLogBasedBalanceAsset',
      ]),
  })
}

export { assetMocks as assets }
