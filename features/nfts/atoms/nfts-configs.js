import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftsConfigsAtom = ({ storage }) => {
  return dedupe(
    createStorageAtomFactory({ storage })({
      key: 'nfts-config',
      defaultValue: {},
      isSoleWriter: true,
    })
  )
}

export default createNftsConfigsAtom
