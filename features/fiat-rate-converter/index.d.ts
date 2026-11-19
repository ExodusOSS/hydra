interface FiatRateConverterConfig {
  defaultCurrency?: string
}

declare const fiatRateConverter: (config?: FiatRateConverterConfig) => {
  id: 'fiatRateConverter'
  definitions: []
}

export default fiatRateConverter
