import createAssetNamesWithBalanceAtom from './asset-names-with-balance.js'
import createAssetsWithBalanceCountAtom from './assets-with-balance-count.js'
import createBalancesAtom from './balances.js'
import createFundedWalletAccountsAtom from './funded-wallet-accounts.js'
import createHasBalanceAtom from './has-balance.js'
import createAssetsTotalWalletAmountsAtom from './asset-total-wallet-amounts.js'

export const balancesAtomDefinition = {
  id: 'balancesAtom',
  type: 'atom',
  factory: createBalancesAtom,
  dependencies: [],
  public: true,
}

export const hasBalanceAtomDefinition = {
  id: 'hasBalanceAtom',
  type: 'atom',
  factory: createHasBalanceAtom,
  dependencies: ['balancesAtom', 'storage'],
  public: true,
}

export const fundedWalletAccountsAtomDefinition = {
  id: 'fundedWalletAccountsAtom',
  type: 'atom',
  factory: createFundedWalletAccountsAtom,
  dependencies: ['balancesAtom', 'enabledWalletAccountsAtom'],
  public: true,
}

export const assetNamesWithBalanceAtomDefinition = {
  id: 'assetNamesWithBalanceAtom',
  type: 'atom',
  factory: createAssetNamesWithBalanceAtom,
  dependencies: ['balancesAtom'],
  public: true,
}

export const assetsWithBalanceCountAtomDefinition = {
  id: 'assetsWithBalanceCountAtom',
  type: 'atom',
  factory: createAssetsWithBalanceCountAtom,
  dependencies: ['assetNamesWithBalanceAtom'],
  public: true,
}

export const assetsTotalWalletAmountsDefinition = {
  id: 'assetsTotalWalletAmountsAtom',
  type: 'atom',
  factory: createAssetsTotalWalletAmountsAtom,
  dependencies: ['balancesAtom'],
  public: true,
}
