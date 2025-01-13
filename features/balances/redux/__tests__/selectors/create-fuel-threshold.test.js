import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { setup } from '../utils.js'

const assets = connectAssets(_assets)
const assetsToEmit = pick(assets, ['ethereum', 'bitcoin', 'tetherusd'])

describe('selectors.createFuelThreshold', () => {
  it("should return false if there's no such asset", () => {
    const { store, selectors } = setup()

    const result = selectors.balances.createFuelThreshold('noncoin')(store.getState())

    expect(result).toBe(null)
  })

  it("should return zero if there's no fee data", () => {
    const { store, selectors, emitAssets } = setup()
    emitAssets(assetsToEmit)

    const result = selectors.balances.createFuelThreshold('ethereum')(store.getState())

    expect(result).toBe(assets.ethereum.currency.ZERO)
  })

  it("should return asset's fee data", () => {
    const { store, selectors, emitAssets, emitFeeData } = setup()
    emitAssets(assetsToEmit)
    const fuelThreshold = assets.ethereum.currency.defaultUnit(2)
    emitFeeData({
      ethereum: {
        fuelThreshold,
      },
    })

    const result = selectors.balances.createFuelThreshold('ethereum')(store.getState())

    expect(result).toBe(fuelThreshold)
  })
})
