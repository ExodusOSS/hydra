import { wrapConstant } from './utils'

const createAdapterDependencies = ({ adapters }) =>
  Object.entries(adapters).map(([id, value]) => wrapConstant({ id, type: 'adapter', value }))

export default createAdapterDependencies
