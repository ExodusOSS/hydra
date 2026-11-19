import { createInMemoryAtom } from '@exodus/atoms'

const walletExistsAtomDefinition = {
  id: 'walletExistsAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(),
  public: true,
}

export default walletExistsAtomDefinition
