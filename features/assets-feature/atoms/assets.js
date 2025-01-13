import { createInMemoryAtom } from '@exodus/atoms'

const assetsAtomDefinition = {
  id: 'assetsAtom',
  type: 'atom',
  factory: createInMemoryAtom,
  dependencies: [],
  public: true,
}

export default assetsAtomDefinition
