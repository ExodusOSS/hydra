import { createStorageAtomFactory } from '@exodus/atoms'

const createPersistedAnalyticsEventsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'storedEvents', defaultValue: [] })
}

const persistedAnalyticsEventsAtomDefinition = {
  id: 'persistedAnalyticsEventsAtom',
  type: 'atom',
  factory: createPersistedAnalyticsEventsAtom,
  dependencies: ['storage'],
  public: true,
}

export default persistedAnalyticsEventsAtomDefinition
