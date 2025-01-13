import type feesApiDefinition from './api/index.js'

declare const fees: () => {
  id: 'fees'
  definitions: [{ definition: typeof feesApiDefinition }]
}

export default fees
