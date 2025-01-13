import { createInMemoryAtom } from '@exodus/atoms'

const primarySeedIdAtomDefinition = {
  id: 'primarySeedIdAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
  public: true,
}

export default primarySeedIdAtomDefinition
