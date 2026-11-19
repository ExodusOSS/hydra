import { createInMemoryAtom } from '@exodus/atoms'
import eventLog from '@exodus/event-log'
import pricingClientDefinition from '@exodus/pricing/module/index.js'
import delay from 'delay'

import _createExodus from '../src/index.js'
import createAdapters from './adapters/index.js'
import defaultConfig from './config.js'
import { APY_RATES } from './fixtures/apy-rates.js'

const createExodus = ({ adapters = createAdapters(), config = defaultConfig, debug } = {}) => {
  const container = _createExodus({ adapters, config, debug })

  // TEMP: BE and mobile have different implementations of personal notes storage. This should go away when unifying
  container.register({
    definition: {
      id: 'personalNotesStorage',
      factory: () => adapters.storage.namespace('personalNotes'),
      public: true,
    },
  })

  // TEMP: BE and mobile have different implementations of the orders atom
  container.register({
    definition: {
      id: 'ordersAtom',
      factory: () => createInMemoryAtom(),
      public: true,
    },
  })

  container.register({
    definition: {
      id: 'pricingClient',
      override: true,
      factory: (args) => {
        const client = pricingClientDefinition.factory(args)

        const simulateRequest = (res) => async () => {
          await delay(10) // simulate some latency.
          return res
        }

        // TODO: make fixtures of other apis to prevent test fetching network
        return {
          ...client,
          stakingRewards: jest.fn(simulateRequest(APY_RATES)),
        }
      },
      dependencies: ['fetch', 'pricingServerUrlAtom'],
      public: true,
    },
  })

  container.register({
    definition: {
      type: 'module',
      id: 'migrateableFusion',
      factory: () => ({
        load: () => Promise.resolve(),
      }),
      public: true,
    },
  })

  container.register({
    definition: {
      id: 'accountsAtom',
      factory: createInMemoryAtom,
      public: true,
    },
  })

  container.use(eventLog())

  return container
}

export default createExodus
