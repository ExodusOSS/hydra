const ratesApi = ({ ratesMonitor }) => ({
  rates: {
    refresh: () => ratesMonitor.update(),
  },
})

const ratesApiDefinition = {
  id: 'ratesApi',
  type: 'api',
  factory: ratesApi,
  dependencies: ['ratesMonitor'],
}

export default ratesApiDefinition
