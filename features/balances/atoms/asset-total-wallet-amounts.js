import { compute, dedupe } from '@exodus/atoms'

const numberUnitMapsAreEqual = (mapA, mapB) => {
  if (mapA.size !== mapB.size) {
    return false
  }

  for (const [key, val] of mapA) {
    const itemB = mapB.get(key)
    if (!itemB || !itemB.equals(val)) {
      return false
    }
  }

  return true
}

const createAssetTotalWalletAmountsAtom = ({ balancesAtom }) => {
  let previousValue = new Map()
  const selector = ({ balances }) => {
    const assetsWithBalances = new Map()

    Object.values(balances).forEach((accountBalances) => {
      Object.keys(accountBalances).forEach((assetName) => {
        const accountAssetBalance = accountBalances[assetName] && accountBalances[assetName].balance
        if (accountAssetBalance) {
          if (assetsWithBalances.has(assetName)) {
            const currentAssetBalance = assetsWithBalances.get(assetName)
            assetsWithBalances.set(assetName, accountAssetBalance.add(currentAssetBalance))
          } else {
            assetsWithBalances.set(assetName, accountAssetBalance)
          }
        }
      })
    })

    if (!numberUnitMapsAreEqual(assetsWithBalances, previousValue)) {
      previousValue = assetsWithBalances
    }

    return previousValue
  }

  return dedupe(compute({ atom: balancesAtom, selector }))
}

export default createAssetTotalWalletAmountsAtom
