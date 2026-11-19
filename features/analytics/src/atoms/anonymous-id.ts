import { createStorageAtomFactory } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'

type Params = {
  storage: Storage<string>
}

const createAnalyticsAnonymousIdAtom = ({ storage }: Params) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'anonymousId', isSoleWriter: true })
}

const analyticsAnonymousIdAtomDefinition = {
  id: 'analyticsAnonymousIdAtom',
  type: 'atom',
  factory: createAnalyticsAnonymousIdAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export default analyticsAnonymousIdAtomDefinition
