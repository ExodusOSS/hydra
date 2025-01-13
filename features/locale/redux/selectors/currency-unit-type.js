import fiat from '@exodus/fiat-currencies'

const resultFunction = (currency) => fiat[currency]

const currencyUnitTypeSelector = {
  id: 'currencyUnitType',
  resultFunction,
  dependencies: [
    //
    { selector: 'currency' },
  ],
}

export default currencyUnitTypeSelector
