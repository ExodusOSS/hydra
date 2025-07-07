import sortAssetsSelectorFactoryCreator from '../helpers/sort-assets-selector-factory-creator.js'

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
      getAccountAssetsBalanceSelector,
      ratesSelector,
      getIsFavoriteAssetSelector,
      ignoreMarketCapAssets,
      assetsListSelector,
    })
const createSortAssetsSelectorFactoryDefinition = (config) => ({
  id: 'createSortAssetsSelectorFactory',
  selectorFactory: createSelectorFactory(config),
  dependencies: [
    //
    { selector: 'byAssetSource' },
    { module: 'balances', selector: 'getAccountAssetsBalanceSelector' },
    { module: 'rates', selector: 'fiatRates' },
    { module: 'favoriteAssets', selector: 'getIsFavorite', optional: true },
  ],
})

export default createSortAssetsSelectorFactoryDefinition
