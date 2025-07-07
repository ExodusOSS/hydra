import { createSelector } from 'reselect'
import { isMultiNetworkAsset } from '../utils.js'

// adds extra props to assets list: balance, fiatBalance, formattedFiatValue and combinedAssets with same props
const selectorFactory =
  (fiatCurrencySelector, getFormatFiat) =>
  ({ assetsListSelector, balancesSelector, fiatBalancesSelector }) =>
    createSelector(
      assetsListSelector,
      balancesSelector,
      fiatBalancesSelector,
      fiatCurrencySelector,
      getFormatFiat,
      (assetsList, balances, fiatBalances, fiatCurrency, formatFiat) => {
        const getExtraProps = (asset) => {
          const fiatValue = fiatBalances?.[asset.name] || fiatCurrency.ZERO
          return {
            balance: balances?.[asset] || asset.currency.ZERO,
            fiatValue,
            formattedFiatValue: formatFiat(fiatValue, { adaptiveFraction: true }),
          }
        }

        return assetsList.map((asset) => {
          if (isMultiNetworkAsset(asset)) {
            let combinedBalance = asset.currency.ZERO
            let combinedFiatValue = fiatCurrency.ZERO

            const combinedAssets = asset.combinedAssets.map((singleAsset) => {
              const extraProps = getExtraProps(singleAsset)
              const { balance, fiatValue } = extraProps

              combinedBalance = combinedBalance.add(
                asset.currency.defaultUnit(balance.toDefaultNumber())
              )
              combinedFiatValue = combinedFiatValue.add(
                fiatCurrency.defaultUnit(fiatValue.toDefaultNumber())
              )

              return {
                ...singleAsset,
                ...extraProps,
              }
            })

            return {
              ...asset,
              combinedAssets,
              balance: combinedBalance,
              fiatValue: combinedFiatValue,
              formattedFiatValue: formatFiat(combinedFiatValue, { adaptiveFraction: true }),
            }
          }

          return {
            ...asset,
            ...getExtraProps(asset),
          }
        })
      }
    )

const createAssetsWithBalanceSelectorDefinition = {
  id: 'createAssetsWithBalance',
  selectorFactory,
  dependencies: [
    //
    { module: 'locale', selector: 'currencyUnitType' },
    { selector: 'getFormatFiat' },
  ],
}

export default createAssetsWithBalanceSelectorDefinition
