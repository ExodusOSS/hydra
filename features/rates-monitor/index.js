import ms from 'ms'

import ratesApi from './api'
import ratesPlugin from './plugin'
import ratesMonitorDefinition from './module'
import { ratesAtomDefinition } from './atoms'
import ratesReportDefinition from './report'
import ratesDebugDefinition from './debug'

const rates = (
  {
    fetchInterval = ms('1m'),
    debounceInterval = ms('0.75s'),
    fetchRealTimePricesInterval = ms('20s'),
    persistRates = false,
  } = Object.create(null)
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
        definition: ratesMonitorDefinition,
        config: {
          fetchInterval,
          debounceInterval,
          fetchRealTimePricesInterval,
        },
      },
      { definition: ratesPlugin },
      { definition: ratesApi },
      { definition: ratesReportDefinition },
      { definition: ratesDebugDefinition },
    ],
  }
}

export default rates
