import feeMonitorsDefinition from './monitor/index.js'
import feesApiDefinition from './api/index.js'
import feesPlugin from './plugin/index.js'
import feeDataAtomDefinition from './atoms/fee-data.js'

const fees = () => {
  return {
    id: 'feeMonitors',
    definitions: [
      { definition: feeMonitorsDefinition },
      { definition: feesApiDefinition },
      { definition: feeDataAtomDefinition },
      { definition: feesPlugin },
    ],
  }
}

export default fees
