import byAssetSelectorDefinition from './by-asset.js'
import createUnconfirmedBalanceSelectorDefinition from './create-unconfirmed-balance.js'
import getBalanceForFieldSelectorDefinition from './get-balance-for-field.js'
import getBalanceSelectors from './get-balance-selectors.js'
import createBalancesSelectorDefinition from './create-balances.js'
import getBalancesSelectorDefinition from './get-balances.js'
import createBalancesSelectors from './create-balance-selectors.js'
import getUnconfirmedBalanceSelectorDefinition from './get-unconfirmed-balance.js'
import createFuelThresholdSelectorDefinition from './create-fuel-threshold.js'
import createRequiresFuelThresholdSelectorDefinition from './create-requires-fuel-threshold.js'

export default [
  byAssetSelectorDefinition,
  createUnconfirmedBalanceSelectorDefinition,
  getBalanceForFieldSelectorDefinition,
  ...getBalanceSelectors,
  ...createBalancesSelectors,
  createBalancesSelectorDefinition,
  getBalancesSelectorDefinition,
  getUnconfirmedBalanceSelectorDefinition,
  createFuelThresholdSelectorDefinition,
  createRequiresFuelThresholdSelectorDefinition,
]
