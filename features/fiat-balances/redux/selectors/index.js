import byAssetSourceSelector from './by-asset-source.js'
import byAssetSelector from './by-asset.js'
import byWalletAccountSelector from './by-wallet-account.js'
import byWalletAccountFieldSelector from './by-wallet-account-field.js'
import byAssetSourceFieldSelector from './by-asset-source-field.js'
import byAssetInActiveAccountSelector from './by-asset-in-active-account.js'
import byBaseAssetSourceSelector from './by-base-asset-source.js'
import byBaseAssetSourceFieldSelector from './by-base-asset-source-field.js'
import optimisticByAssetInActiveAccountSelector from './optimistic/by-asset-in-active-account.js'
import optimisticByAssetSourceSelector from './optimistic/by-asset-source.js'
import optimisticByAssetSourceFieldSelector from './optimistic/by-asset-source-field.js'
import optimisticByBaseAssetSourceSelector from './optimistic/by-base-asset-source.js'
import optimisticByBaseAssetInActiveAccountSelector from './optimistic/by-base-asset-in-active-account.js'
import optimisticByBaseAssetSourceFieldSelector from './optimistic/by-base-asset-source-field.js'
import optimisticByWalletAccountSelector from './optimistic/by-wallet-account.js'
import optimisticByWalletAccountFieldSelector from './optimistic/by-wallet-account-field.js'
import optimisticTotalBalanceSelector from './optimistic/total-balance.js'
import createSortAssetsSelectorFactorySelector from './sorted-assets/create-sort-assets-selector-factory.js'
import createAssetsWithBalanceSelector from './helpers/create-assets-with-balance.js'
import sortedAssetsWithoutParentCombinedInActiveAccountSelector from './sorted-assets/without-parent-combined-in-active-account.js'
import sortedAssetsWithParentCombinedInActiveAccountSelector from './sorted-assets/with-parent-combined-in-active-account.js'
import getFormatFiatSelector from './get-format-fiat.js'
import sortedAssetsWithBalanceInActiveAccountSelector from './sorted-assets/with-balance-in-active-account.js'
import sortedAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-assets/with-parent-combined-with-balance-in-active-account.js'
import sortedAssetsWithTotalBalanceSelector from './sorted-assets/with-total-balance.js'
import sortedEnabledAssetsWithBalanceInActiveAccountSelector from './sorted-assets/enabled/with-balance-in-active-account.js'
import createEnabledAssetsWithBalanceSelector from './helpers/create-enabled-assets-with-balance.js'
import sortedEnabledAssetsWithTotalBalanceSelector from './sorted-assets/enabled/with-total-balance.js'
import sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-assets/enabled/with-parent-combined-with-balance-in-active-account.js'
import conversionsSelector from './conversions.js'
import createConversionSelector from './create-conversion.js'
import createConversionsSelector from './create-conversions.js'
import createAssetConversion from './create-asset-conversion.js'
import createAssetConversionUsd from './create-asset-conversion-usd.js'
import createSortOptimisticAssetsSelectorFactoryDefinition from './sorted-optimistic-assets/create-sort-assets-selector-factory.js'
import sortedOptimisticAssetsWithoutParentCombinedInActiveAccountDefinition from './sorted-optimistic-assets/without-parent-combined-in-active-account.js'
import sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/with-parent-combined-with-balance-in-active-account.js'
import sortedOptimisticAssetsWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/with-balance-in-active-account.js'
import sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/enabled/with-parent-combined-with-balance-in-active-account.js'
import sortedOptimisticEnabledAssetsWithBalanceInActiveAccountSelectorDefinition from './sorted-optimistic-assets/enabled/with-balance-in-active-account.js'
import sortedOptimisticAssetsWithParentCombinedInActiveAccountDefinition from './sorted-optimistic-assets/with-parent-combined-in-active-account.js'

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
