const featureFlagsApi = ({ featureFlagAtoms }) => ({
  features: {
    set: (feature, value) => featureFlagAtoms[feature]?.set({ isOn: value }),
    enable: (feature) => featureFlagAtoms[feature]?.set({ isOn: true }),
    disable: (feature) => featureFlagAtoms[feature]?.set({ isOn: false }),
  },
})

const featureFlagsApiDefinition = {
  id: 'featureFlagsApi',
  type: 'api',
  factory: featureFlagsApi,
  dependencies: ['featureFlagAtoms'],
}

export default featureFlagsApiDefinition
