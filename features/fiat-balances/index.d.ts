interface FiatBalancesConfig {
  optimistic?: boolean
  balanceFields?: string[]
  nonDustAssets?: any
  assetsToTrackForBalances?: any[]
}

declare const fiatBalances: (config?: FiatBalancesConfig) => {
  id: 'fiatBalances'
  definitions: []
}

export default fiatBalances
