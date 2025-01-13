import { createStorageAtomFactory } from '@exodus/atoms'

const createLanguageAtom = ({ storage, config }) =>
  createStorageAtomFactory({ storage })({
    key: 'language',
    defaultValue: config.defaultValue,
    isSoleWriter: true,
  })

export default createLanguageAtom
