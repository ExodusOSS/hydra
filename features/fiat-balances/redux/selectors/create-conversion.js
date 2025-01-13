import { getCreateConversion } from '../../shared/get-create-conversion.js'
import { memoize } from '@exodus/basic-utils'

const resultFunction = (fiatCurrency, assets, rates) =>
  memoize((assetName) => getCreateConversion(fiatCurrency, rates)(assets[assetName]))

const createConversionSelectorDefinition = {
  id: 'createConversion',
  resultFunction,
  dependencies: [
    //
    { selector: 'currencyUnitType', module: 'locale' },
    { selector: 'all', module: 'assets' },
    { selector: 'fiatRates', module: 'rates' },
  ],
}

export default createConversionSelectorDefinition
