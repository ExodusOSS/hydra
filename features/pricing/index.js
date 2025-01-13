import pricingClientDefinition from './module/index.js'
import pricingApi from './api/index.js'
import { pricingServerUrlAtomDefinition } from './atoms/index.js'

const ENV_CONFIG = {
  sandbox: {
    pricingServerPath: 'infrastructure.price-server.server',
    defaultPricingServerUrl: 'https://pricing-s.a.exodus.io',
  },
  production: {
    pricingServerPath: 'infrastructure.price-server.server',
    defaultPricingServerUrl: 'https://pricing.a.exodus.io',
  },
}

const pricing = ({ sandbox = false, ...configOverrides } = Object.create(null)) => {
  const config = {
    ...(sandbox ? ENV_CONFIG.sandbox : ENV_CONFIG.production),
    ...configOverrides,
  }

  return {
    id: 'pricing',
    definitions: [
      {
        definition: pricingClientDefinition,
      },
      {
        definition: pricingServerUrlAtomDefinition,
        config,
      },
      { definition: pricingApi },
    ],
  }
}

export default pricing
