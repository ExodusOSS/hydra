import { createInMemoryAtom } from '@exodus/atoms'

const primarySeedIdAtomDefinition = {
  id: 'primarySeedIdAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // oxlint-disable-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  public: true,
}

export default primarySeedIdAtomDefinition
