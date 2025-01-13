import { createInMemoryAtom } from '@exodus/atoms'

export const ratesAtomDefinition = {
  id: 'ratesAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
  dependencies: [],
  public: true,
}
