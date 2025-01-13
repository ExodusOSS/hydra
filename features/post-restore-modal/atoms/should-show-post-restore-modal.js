import { createStorageAtomFactory } from '@exodus/atoms'

const shouldShowPostRestoredModalAtomDefinition = {
  id: 'shouldShowPostRestoredModalAtom',
  type: 'atom',
  factory: ({ storage }) =>
    createStorageAtomFactory({
      storage,
    })({ key: 'data', defaultValue: false, isSoleWriter: true }),
  dependencies: ['storage'],
  public: true,
}

export default shouldShowPostRestoredModalAtomDefinition
