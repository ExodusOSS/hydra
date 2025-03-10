import byAssetSourceSelector from './by-asset-source'
import byAssetSelector from './by-asset'
import byWalletAccountSelector from './by-wallet-account'
import byWalletAccountFieldSelector from './by-wallet-account-field'
import byAssetSourceFieldSelector from './by-asset-source-field'
import byAssetInActiveAccountSelector from './by-asset-in-active-account'
import byBaseAssetSourceSelector from './by-base-asset-source'
import byBaseAssetSourceFieldSelector from './by-base-asset-source-field'
import optimisticByAssetInActiveAccountSelector from './optimistic/by-asset-in-active-account'
import optimisticByAssetSourceSelector from './optimistic/by-asset-source'
import optimisticByAssetSourceFieldSelector from './optimistic/by-asset-source-field'
import optimisticByBaseAssetSourceSelector from './optimistic/by-base-asset-source'
import optimisticByBaseAssetInActiveAccountSelector from './optimistic/by-base-asset-in-active-account.js'
import optimisticByBaseAssetSourceFieldSelector from './optimistic/by-base-asset-source-field'
import optimisticByWalletAccountSelector from './optimistic/by-wallet-account'
import optimisticByWalletAccountFieldSelector from './optimistic/by-wallet-account-field'
import optimisticTotalBalanceSelector from './optimistic/total-balance'
import createSortAssetsSelectorFactorySelector from './sorted-assets/create-sort-assets-selector-factory'
import createAssetsWithBalanceSelector from './helpers/create-assets-with-balance'
import sortedAssetsWithoutParentCombinedInActiveAccountSelector from './sorted-assets/without-parent-combined-in-active-account'
import sortedAssetsWithParentCombinedInActiveAccountSelector from './sorted-assets/with-parent-combined-in-active-account'
import getFormatFiatSelector from './get-format-fiat'
import sortedAssetsWithBalanceInActiveAccountSelector from './sorted-assets/with-balance-in-active-account'
import sortedAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-assets/with-parent-combined-with-balance-in-active-account'
import sortedAssetsWithTotalBalanceSelector from './sorted-assets/with-total-balance'
import sortedEnabledAssetsWithBalanceInActiveAccountSelector from './sorted-assets/enabled/with-balance-in-active-account'
import createEnabledAssetsWithBalanceSelector from './helpers/create-enabled-assets-with-balance'
import sortedEnabledAssetsWithTotalBalanceSelector from './sorted-assets/enabled/with-total-balance'
import sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-assets/enabled/with-parent-combined-with-balance-in-active-account'
import conversionsSelector from './conversions.js'
import createConversionSelector from './create-conversion.js'
import createConversionsSelector from './create-conversions.js'
import createAssetConversion from './create-asset-conversion'
import createAssetConversionUsd from './create-asset-conversion-usd'
import createSortOptimisticAssetsSelectorFactoryDefinition from './sorted-optimistic-assets/create-sort-assets-selector-factory'
import sortedOptimisticAssetsWithoutParentCombinedInActiveAccountDefinition from './sorted-optimistic-assets/without-parent-combined-in-active-account'
import sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/with-parent-combined-with-balance-in-active-account'
import sortedOptimisticAssetsWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/with-balance-in-active-account'
import sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/enabled/with-parent-combined-with-balance-in-active-account'
import sortedOptimisticEnabledAssetsWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/enabled/with-balance-in-active-account'
import sortedOptimisticAssetsWithParentCombinedInActiveAccountDefinition from './sorted-optimistic-assets/with-parent-combined-in-active-account'

export default function createSelectorDefinitions(config) {
  return [
    byAssetSelector,
    byAssetSourceSelector,
    byAssetSourceFieldSelector,
    byAssetInActiveAccountSelector,
    byBaseAssetSourceSelector,
    byBaseAssetSourceFieldSelector,
    byWalletAccountSelector,
    byWalletAccountFieldSelector,
    optimisticByAssetInActiveAccountSelector,
    optimisticByAssetSourceSelector,
    optimisticByAssetSourceFieldSelector,
    optimisticByBaseAssetSourceSelector,
    optimisticByBaseAssetInActiveAccountSelector,
    optimisticByBaseAssetSourceFieldSelector,
    optimisticByWalletAccountSelector,
    optimisticByWalletAccountFieldSelector,
    optimisticTotalBalanceSelector,
    createSortAssetsSelectorFactorySelector(config),
    createAssetsWithBalanceSelector,
    createEnabledAssetsWithBalanceSelector,
    sortedAssetsWithoutParentCombinedInActiveAccountSelector,
    sortedAssetsWithParentCombinedInActiveAccountSelector,
    sortedAssetsWithBalanceInActiveAccountSelector,
    sortedAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition,
    sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition,
    sortedEnabledAssetsWithBalanceInActiveAccountSelector,
    sortedEnabledAssetsWithTotalBalanceSelector,
    sortedAssetsWithTotalBalanceSelector,
    getFormatFiatSelector,
    conversionsSelector,
    createConversionSelector,
    createConversionsSelector,
    createAssetConversion,
    createAssetConversionUsd,
    createSortOptimisticAssetsSelectorFactoryDefinition(config),
    sortedOptimisticAssetsWithoutParentCombinedInActiveAccountDefinition,
    sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition,
    sortedOptimisticAssetsWithBalanceInActiveAccountSelectorDefinition,
    sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition,
    sortedOptimisticEnabledAssetsWithBalanceInActiveAccountSelectorDefinition,
    sortedOptimisticAssetsWithParentCombinedInActiveAccountDefinition,
  ]
}
