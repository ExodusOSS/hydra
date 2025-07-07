import ms from 'ms'

import ratesApi from './api/index.js'
import { ratesAtomDefinition, simulationEnabledAtomDefinition } from './atoms/index.js'
import ratesDebugDefinition from './debug/index.js'
import ratesMonitorDefinition from './module/index.js'
import ratesPlugin from './plugin/index.js'

const rates = (
  {
    fetchInterval = ms('1m'),
    debounceInterval = ms('0.75s'),
    fetchRealTimePricesInterval = ms('25s'),
    simulationInterval = ms('5s'),
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
        definition: simulationEnabledAtomDefinition,
        storage: { namespace: 'rates' },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      },
      {
        definition: ratesMonitorDefinition,
        config: {
          fetchInterval,
          debounceInterval,
          fetchRealTimePricesInterval,
          simulationInterval,
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
