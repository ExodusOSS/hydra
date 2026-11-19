const featureFlagsApi = ({ featureFlagAtoms, featureFlags }) => ({
  features: {
    isEnabled: (key) => featureFlags.isEnabled(key),
    getValue: (key, defaultValue) => featureFlags.getValue(key, defaultValue),
    trackExposure: async (key) => featureFlags.trackExposure(key),

    set: (feature, value) => featureFlagAtoms[feature]?.set({ isOn: value }),
    enable: (feature) => featureFlagAtoms[feature]?.set({ isOn: true }),
    disable: (feature) => featureFlagAtoms[feature]?.set({ isOn: false }),
  },
})

const featureFlagsApiDefinition = {
  id: 'featureFlagsApi',
  type: 'api',
  factory: featureFlagsApi,
  dependencies: ['featureFlagAtoms', 'featureFlags'],
}

export default featureFlagsApiDefinition
