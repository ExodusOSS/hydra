import { createInMemoryAtom } from '@exodus/atoms'

const createNonDustBalanceAssetNamesAtom = () => createInMemoryAtom({ defaultValue: [] })

export default createNonDustBalanceAssetNamesAtom
