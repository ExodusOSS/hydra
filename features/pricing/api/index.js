const pricingApi = ({ pricingClient }) => ({
  pricing: {
    currentPrice: pricingClient.currentPrice,
    historicalPrice: pricingClient.historicalPrice,
    ticker: pricingClient.ticker,
  },
})

const pricingApiDefinition = {
  id: 'pricingApi',
  type: 'api',
  factory: pricingApi,
  dependencies: ['pricingClient'],
}

export default pricingApiDefinition
