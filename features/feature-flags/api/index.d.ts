declare const featureFlagsApiDefinition: {
  id: 'featureFlagsApi'
  type: 'api'
  factory(): {
    features: {
      enable(feature: string): Promise<void>
      disable(feature: string): Promise<void>
    }
  }
}

export default featureFlagsApiDefinition
