import sortAssetsSelectorFactoryCreator from '../helpers/sort-assets-selector-factory-creator'

const noBalances = Object.freeze(Object.create(null))
const noBalancesSelector = () => () => noBalances

const createSelectorFactory =
  ({ ignoreMarketCapAssets }) =>
  (
    fiatBalancesByAssetSourceSelector,
    getAccountAssetsBalanceSelector,
    ratesSelector,
    getIsFavoriteAssetSelector
  ) =>
  (assetsListSelector) =>
    sortAssetsSelectorFactoryCreator({
      fiatBalancesByAssetSourceSelector,
      getAccountAssetsBalanceSelector: getAccountAssetsBalanceSelector.isFallback
        ? noBalancesSelector
        : getAccountAssetsBalanceSelector,
      ratesSelector,
      getIsFavoriteAssetSelector,
      ignoreMarketCapAssets,
      assetsListSelector,
    })
const createSortOptimisticAssetsSelectorFactoryDefinition = (config) => ({
  id: 'createSortOptimisticAssetsSelectorFactory',
  selectorFactory: createSelectorFactory(config),
  dependencies: [
    //
    { selector: 'byAssetSource' },
    { module: 'optimisticBalances', selector: 'getAccountAssetsBalanceSelector', optional: true },
    { module: 'rates', selector: 'fiatRates' },
    { module: 'favoriteAssets', selector: 'getIsFavorite', optional: true },
  ],
})

export default createSortOptimisticAssetsSelectorFactoryDefinition
