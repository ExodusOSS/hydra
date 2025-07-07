const resultFunction = (state) => {
  if (state?.rates?.simulationEnabled !== undefined) {
    return state.rates.simulationEnabled
  }

  return false
}

const simulationEnabledSelector = {
  id: 'ratesSimulationEnabled',
  resultFunction,
  dependencies: [],
}

export default simulationEnabledSelector
