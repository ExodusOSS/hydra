import { createInMemoryAtom } from '@exodus/atoms'

export const geolocationAtomDefinition = {
  id: 'geolocationAtom',
  type: 'atom',
  factory: createInMemoryAtom,
  dependencies: [],
  public: true,
}
