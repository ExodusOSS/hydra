import type { Config } from './module/types'
import { DEFAULT_CONFIG } from './module/constants'

import transactionSimulatorDefinition from './module'
import transactionSimulatorApiDefinition from './api'

const txSimulator = (config: Config = Object.create(null)) => {
  const actualConfig = { ...DEFAULT_CONFIG, ...config }

  return {
    id: 'txSimulator',
    definitions: [
      { definition: transactionSimulatorDefinition, config: actualConfig },
      { definition: transactionSimulatorApiDefinition },
    ],
  }
}

export default txSimulator
