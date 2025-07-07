import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftCollectionStatsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return dedupe(
    atomFactory({
      key: 'nftsCollectionStats',
      defaultValue: Object.create(null),
      isSoleWriter: true,
    })
  )
}

export default createNftCollectionStatsAtom
