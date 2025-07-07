import type ratesApiDefinition from './api/index.js'

declare const rates: () => {
  id: 'rates'
  definitions: [{ definition: typeof ratesApiDefinition }]
}

export default rates
