import { createStorageAtomFactory } from '@exodus/atoms'

const createSeedMetadataAtom = ({ storage }) => {
  const createStorageAtom = createStorageAtomFactory({ storage })

  return createStorageAtom({ key: 'seedMetadata', isSoleWriter: true })
}

const seedMetadataAtomDefinition = {
  id: 'seedMetadataAtom',
  type: 'atom',
  factory: createSeedMetadataAtom,
  dependencies: ['storage'],
  public: true,
}

export default seedMetadataAtomDefinition
