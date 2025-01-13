import { createInMemoryAtom } from '@exodus/atoms'

const feeDataAtomDefinition = {
  id: 'feeDataAtom',
  type: 'atom',
  factory: () => createInMemoryAtom({ defaultValue: {} }),
  dependencies: [],
  public: true,
}

export default feeDataAtomDefinition
