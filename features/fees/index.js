import feesApiDefinition from './api/index.js'
import feesModuleDefinition from './module/index.js'

const fees = () => ({
  id: 'fees',
  definitions: [
    {
      definition: feesModuleDefinition,
    },
    {
      definition: feesApiDefinition,
    },
  ],
})

export default fees
