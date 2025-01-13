import { createInMemoryAtom } from '@exodus/atoms'

const addressCacheAtomDefinition = {
  id: 'addressCacheAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
  public: true,
}

export default addressCacheAtomDefinition
