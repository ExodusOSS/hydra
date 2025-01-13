import { createStorageAtomFactory } from '@exodus/atoms'

const createAnalyticsAnonymousIdAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'anonymousId', isSoleWriter: true })
}

const analyticsAnonymousIdAtomDefinition = {
  id: 'analyticsAnonymousIdAtom',
  type: 'atom',
  factory: createAnalyticsAnonymousIdAtom,
  dependencies: ['storage'],
  public: true,
}

export default analyticsAnonymousIdAtomDefinition
