import { createStorageAtomFactory } from '@exodus/atoms'
import { DEFAULT_NAME } from '../constants'

const createLocalProfileAtom = ({ storage, config }) => {
  const defaultValue = { name: config?.defaultName || DEFAULT_NAME, nft: null }
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'data',
    defaultValue,
    isSoleWriter: true,
  })
}

export default createLocalProfileAtom
