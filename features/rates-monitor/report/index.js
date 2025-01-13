const createRatesReport = ({ ratesAtom }) => ({
  namespace: 'rates',
  export: async () => {
    const rates = await ratesAtom.get()
    const firstCurrencyKey = Object.keys(rates)[0]
    return firstCurrencyKey ? Object.keys(rates[firstCurrencyKey]) : []
  },
})

const ratesReportDefinition = {
  id: 'ratesReport',
  type: 'report',
  factory: createRatesReport,
  dependencies: ['ratesAtom'],
  public: true,
}

export default ratesReportDefinition
