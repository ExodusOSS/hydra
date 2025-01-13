import { createStorageAtomFactory } from '@exodus/atoms'

const createPersistedAnalyticsTraitsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'storedTraits', defaultValue: [] })
}

const persistedAnalyticsTraitsAtomDefinition = {
  id: 'persistedAnalyticsTraitsAtom',
  type: 'atom',
  factory: createPersistedAnalyticsTraitsAtom,
  dependencies: ['storage'],
  public: true,
}

export default persistedAnalyticsTraitsAtomDefinition
