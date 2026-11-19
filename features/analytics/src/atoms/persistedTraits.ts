import { createStorageAtomFactory } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'

type Params = {
  storage: Storage<unknown[]>
}

const createPersistedAnalyticsTraitsAtom = ({ storage }: Params) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'storedTraits', defaultValue: [] })
}

const persistedAnalyticsTraitsAtomDefinition = {
  id: 'persistedAnalyticsTraitsAtom',
  type: 'atom',
  factory: createPersistedAnalyticsTraitsAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export default persistedAnalyticsTraitsAtomDefinition
