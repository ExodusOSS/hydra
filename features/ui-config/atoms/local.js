import { createStorageAtomFactory } from '@exodus/atoms'

const createLocalUiConfigAtom = ({ id, atomId, encrypted, defaultValue }) => ({
  definition: {
    id: atomId,
    type: 'atom',
    factory: ({ storage }) =>
      createStorageAtomFactory({ storage })({ key: id, isSoleWriter: true, defaultValue }),
    dependencies: ['storage'],
    public: true,
  },
  aliases: [{ implementationId: encrypted ? 'storage' : 'unsafeStorage', interfaceId: 'storage' }],
  storage: { namespace: 'uiConfig' },
})

export default createLocalUiConfigAtom
