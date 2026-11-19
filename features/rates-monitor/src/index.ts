import ms from 'ms'

import ratesApi from './api/index.js'
import { ratesAtomDefinition, ratesAssetNamesToMonitorAtomDefinition } from './atoms/index.js'
import ratesDebugDefinition from './debug/index.js'
import ratesMonitorDefinition from './module/index.js'
import ratesPlugin from './plugin/index.js'

export type { RatesApi } from './api/index.js'
export type { Rate, RateByAssetTicker, RatesByCurrency } from './redux/types.js'

type FiatCurrencyOverrides = Record<string, string>

type RatesConfig = {
  fetchInterval?: number
  debounceInterval?: number
  fetchRealTimePricesInterval?: number
  persistRates?: boolean
  fiatCurrencyOverrides?: FiatCurrencyOverrides
}

const rates = (
  {
    fetchInterval = ms('1m'),
    debounceInterval = ms('0.75s'),
    fetchRealTimePricesInterval = ms('25s'),
    persistRates = false,
    fiatCurrencyOverrides,
  }: RatesConfig = Object.create(null)
) => {
  return {
    id: 'rates',
    definitions: [
      {
        definition: ratesAtomDefinition,
        config: {
          persistRates,
        },
        storage: { namespace: 'rates' },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      },

      {
        definition: ratesAssetNamesToMonitorAtomDefinition,
      },
      {
        definition: ratesMonitorDefinition,
        config: {
          fetchInterval,
          debounceInterval,
          fetchRealTimePricesInterval,
          fiatCurrencyOverrides,
        },
      },
      { definition: ratesPlugin },
      { definition: ratesApi },
      // This report was intentionally omitted as it did not provide useful value in practice.
      // We prefer less data over more when it's not meaningful, keeping them commented for reference.
      // { definition: ratesReportDefinition },
      { definition: ratesDebugDefinition },
    ],
  }
}

export default rates
