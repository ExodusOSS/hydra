import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return dedupe(
    atomFactory({
      key: 'nfts',
      defaultValue: Object.create(null),
      isSoleWriter: true,
    })
  )
}

export default createNftsAtom
