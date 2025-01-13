const DEFAULT = {}
const resultFunction = (rates, currency) => rates?.[currency] ?? DEFAULT

const fiatRatesSelector = {
  id: 'fiatRates',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { module: 'locale', selector: 'currency' },
  ],
}

export default fiatRatesSelector
