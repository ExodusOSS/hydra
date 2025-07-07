const ratesApi = ({ ratesMonitor }) => ({
  rates: {
    refresh: () => ratesMonitor.update(),
    simulation: {
      enable: () => ratesMonitor.enableSimulation(),
      disable: () => ratesMonitor.disableSimulation(),
      isEnabled: () => ratesMonitor.isSimulationEnabled(),
    },
  },
})

const ratesApiDefinition = {
  id: 'ratesApi',
  type: 'api',
  factory: ratesApi,
  dependencies: ['ratesMonitor'],
}

export default ratesApiDefinition
