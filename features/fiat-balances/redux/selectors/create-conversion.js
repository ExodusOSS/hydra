import { getCreateConversion } from '../../shared/get-create-conversion.js'
import { memoize } from '@exodus/basic-utils'

const resultFunction = (fiatCurrency, getAsset, rates) =>
  memoize((assetName) => getCreateConversion(fiatCurrency, rates)(getAsset(assetName)))

const createConversionSelectorDefinition = {
  id: 'createConversion',
  resultFunction,
  dependencies: [
    //
    { selector: 'currencyUnitType', module: 'locale' },
    { selector: 'getAsset', module: 'assets' },
    { selector: 'fiatRates', module: 'rates' },
  ],
}

export default createConversionSelectorDefinition
