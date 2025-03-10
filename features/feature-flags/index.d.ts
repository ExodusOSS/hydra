import type featureFlagsApiDefinition from './api/index.js'

declare const featureFlags: () => {
  id: 'featureFlags'
  definitions: [{ definition: typeof featureFlagsApiDefinition }]
}

export default featureFlags
