import { createStorageAtomFactory } from '@exodus/atoms'

const createCurrencyAtom = ({ storage, config }) =>
  createStorageAtomFactory({ storage })({
    key: 'currency',
    defaultValue: config.defaultValue,
    isSoleWriter: true,
  })

export default createCurrencyAtom
