import featureFlagsApiDefinition from './api'

declare const featureFlags: () => {
  id: 'featureFlags'
  definitions: [{ definition: typeof featureFlagsApiDefinition }]
}

export default featureFlags
