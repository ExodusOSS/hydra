import type { Definition } from '@exodus/dependency-types'

import type { RatesMonitor } from '../module/index.js'

export interface RatesApi {
  rates: {
    refresh(): Promise<void>
    fetchTickers(tickers: string[]): Promise<void>
  }
}

const ratesApi = ({ ratesMonitor }: { ratesMonitor: RatesMonitor }): RatesApi => ({
  rates: {
    refresh: () => ratesMonitor.update(),
    fetchTickers: (tickers) => ratesMonitor.fetchTickers(tickers),
  },
})

const ratesApiDefinition = {
  id: 'ratesApi',
  type: 'api',
  factory: ratesApi,
  dependencies: ['ratesMonitor'],
} as const satisfies Definition

export default ratesApiDefinition
