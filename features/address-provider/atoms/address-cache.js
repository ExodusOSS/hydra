import { createInMemoryAtom } from '@exodus/atoms'

const addressCacheAtomDefinition = {
  id: 'addressCacheAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // oxlint-disable-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  public: true,
}

export default addressCacheAtomDefinition
