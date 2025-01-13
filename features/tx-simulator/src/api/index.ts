import type { SimulateParams, TxSimulator } from '../module/types'
import type { Definition } from '@exodus/dependency-types'

const createTransactionSimulatorApi = ({ txSimulator }: { txSimulator: TxSimulator }) => ({
  transactionSimulator: {
    simulate: (params: SimulateParams) => txSimulator.simulate(params),
  },
})

const transactionSimulatorApiDefinition = {
  id: 'transactionSimulatorApi',
  type: 'api',
  factory: createTransactionSimulatorApi,
  dependencies: ['txSimulator'],
} as const satisfies Definition

export default transactionSimulatorApiDefinition
