import { getCreateConversion } from '../../shared/get-create-conversion.js'
import { mapValues } from '@exodus/basic-utils'

const resultFunction = (fiatCurrency, assets, rates) => {
  const createConversion = getCreateConversion(fiatCurrency, rates)
  return mapValues(assets, (asset) => createConversion(asset))
}

const conversionsSelectorDefinition = {
  id: 'conversions',
  resultFunction,
  dependencies: [
    //
    { selector: 'currencyUnitType', module: 'locale' },
    { selector: 'all', module: 'assets' },
    { selector: 'fiatRates', module: 'rates' },
  ],
}

export default conversionsSelectorDefinition
