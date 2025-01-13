import transactionSimulatorDefinition from './module'
import transactionSimulatorApiDefinition from './api'

const txSimulator = () => {
  return {
    id: 'txSimulator',
    definitions: [
      { definition: transactionSimulatorDefinition },
      { definition: transactionSimulatorApiDefinition },
    ],
  }
}

export default txSimulator
