import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftsTxsAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return dedupe(
    atomFactory({
      key: 'txs',
      defaultValue: Object.create(null),
      isSoleWriter: true,
    })
  )
}

export default createNftsTxsAtom
