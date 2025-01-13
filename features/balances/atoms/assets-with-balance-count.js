import { compute } from '@exodus/atoms'

const createAssetsWithBalanceCountAtom = ({ assetNamesWithBalanceAtom }) => {
  const selector = (assetNamesWithBalance) => assetNamesWithBalance.size
  return compute({ atom: assetNamesWithBalanceAtom, selector })
}

export default createAssetsWithBalanceCountAtom
