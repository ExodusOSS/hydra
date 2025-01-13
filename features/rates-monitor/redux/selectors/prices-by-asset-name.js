/*
{
  "bitcoin": {
    USD: 100,
    EUR: 200
  },
  ...
}
*/

const resultFunction = (rates, loading, currencyName, getAssetFromTicker) =>
  loading
    ? {}
    : Object.keys(rates).reduce((acc, ticker) => {
        const asset = getAssetFromTicker(ticker)
        if (!asset) {
          console.warn('pricesByAssetNameSelector missing asset when looking for ticker', ticker)
          return acc
        }

        acc[asset.name] = {
          USD: rates[ticker].priceUSD || 0,
          [currencyName]: rates[ticker].price || 0,
        }
        return acc
      }, {})

const pricesByAssetNameSelector = {
  id: 'pricesByAssetName',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatRates' },
    { selector: 'loading' },
    { module: 'locale', selector: 'currency' },
    { module: 'assets', selector: 'getAssetFromTicker' },
  ],
}

export default pricesByAssetNameSelector
