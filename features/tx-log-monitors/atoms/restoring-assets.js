import { createStorageAtomFactory } from '@exodus/atoms'

const createRestoringAssetsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })
  return atomFactory({
    key: 'data',
    defaultValue: Object.create(null),
    isSoleWriter: true,
  })
}

export default createRestoringAssetsAtom
