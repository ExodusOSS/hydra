import { createStorageAtomFactory } from '@exodus/atoms'

const createEnabledAndDisabledAssetsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })
  return atomFactory({
    key: 'data',
    defaultValue: { disabled: Object.create(null) },
    isSoleWriter: true,
  })
}

export default createEnabledAndDisabledAssetsAtom
