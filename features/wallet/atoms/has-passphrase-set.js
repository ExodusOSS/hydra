import { createInMemoryAtom } from '@exodus/atoms'

const hasPassphraseSetAtomDefinition = {
  id: 'hasPassphraseSetAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(),
  public: true,
}

export default hasPassphraseSetAtomDefinition
