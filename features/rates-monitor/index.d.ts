import type ratesApiDefinition from './api'

declare const rates: () => {
  id: 'rates'
  definitions: [{ definition: typeof ratesApiDefinition }]
}

export default rates
