import type pricingApiDefinition from './api/index.js'

declare const pricing: () => {
  id: 'pricing'
  definitions: [{ definition: typeof pricingApiDefinition }]
}

export default pricing
