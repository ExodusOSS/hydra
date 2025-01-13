import createFiatBalancesAtom from './fiat-balances'
import createOptimisticFiatBalancesAtom from './optimistic-fiat-balances'
import createNonDustBalanceAssetNamesAtom from './non-dust-balance-asset-names-atom'

export const fiatBalancesAtomDefinition = {
  id: 'fiatBalancesAtom',
  type: 'atom',
  factory: createFiatBalancesAtom,
  dependencies: [],
  public: true,
}

export const optimisticFiatBalancesAtomDefinition = {
  id: 'optimisticFiatBalancesAtom',
  type: 'atom',
  factory: createOptimisticFiatBalancesAtom,
  dependencies: [],
  public: true,
}

export const nonDustBalanceAssetNamesAtomDefinition = {
  id: 'nonDustBalanceAssetNamesAtom',
  type: 'atom',
  factory: createNonDustBalanceAssetNamesAtom,
  dependencies: [],
  public: true,
}
