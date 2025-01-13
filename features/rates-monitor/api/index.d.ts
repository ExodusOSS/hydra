declare const ratesApiDefinition: {
  id: 'ratesApi'
  type: 'api'
  factory(): {
    rates: {
      refresh: () => Promise<void>
    }
  }
}

export default ratesApiDefinition
