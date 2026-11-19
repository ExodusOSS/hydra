import { createStorageAtomFactory } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'

type Params = {
  storage: Storage<unknown[]>
}

const createPersistedAnalyticsEventsAtom = ({ storage }: Params) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'storedEvents', defaultValue: [] })
}

const persistedAnalyticsEventsAtomDefinition = {
  id: 'persistedAnalyticsEventsAtom',
  type: 'atom',
  factory: createPersistedAnalyticsEventsAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export default persistedAnalyticsEventsAtomDefinition
