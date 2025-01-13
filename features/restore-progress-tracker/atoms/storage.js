import { createStorageAtomFactory } from '@exodus/atoms'

const createRestoringAssetsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })
  return atomFactory({
    key: 'data',
    defaultValue: {},
    isSoleWriter: true,
  })
}

export default createRestoringAssetsAtom
