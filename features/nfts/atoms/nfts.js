import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return dedupe(
    atomFactory({
      key: 'nfts',
      defaultValue: {},
      isSoleWriter: true,
    })
  )
}

export default createNftsAtom
