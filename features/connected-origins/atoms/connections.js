import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

export default function createConnectedOriginsAtom({ storage }) {
  return dedupe(
    createStorageAtomFactory({ storage })({
      key: 'data',
      defaultValue: [],
      isSoleWriter: true,
    })
  )
}
