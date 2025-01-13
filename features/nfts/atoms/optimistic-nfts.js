import { createInMemoryAtom, dedupe } from '@exodus/atoms'

const createOptimisticNftsAtom = () =>
  dedupe(createInMemoryAtom({ defaultValue: Object.create(null) }))

export default createOptimisticNftsAtom
