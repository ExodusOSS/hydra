import { createInMemoryAtom } from '@exodus/atoms'

import createAvailableAssetNamesAtom from '../available-asset-names/factory.js'
import selector from '../available-asset-names/selector.js'

const setup = async () => {
  const assets = [{ assetName: 'bitcoin' }, { assetName: 'ethereum' }]
  const availableAssetsAtom = createInMemoryAtom()
  const availableAssetNamesAtom = createAvailableAssetNamesAtom({ availableAssetsAtom })

  await availableAssetsAtom.set(assets)

  return { assets, availableAssetsAtom, availableAssetNamesAtom }
}

describe('availableAssetNamesAtom', () => {
  describe('selector memoization', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('.get', () => {
      it('memoizes returned value', async () => {
        const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()

        await availableAssetsAtom.set(assets)
        await Promise.all([availableAssetNamesAtom.get(), availableAssetNamesAtom.get()])

        expect(selector).toHaveBeenCalledTimes(1)
      })

      it('updates value on change', async () => {
        const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()
        await Promise.all([availableAssetNamesAtom.get(), availableAssetNamesAtom.get()])

        const updated = assets.slice(1)
        await availableAssetsAtom.set(updated)
        await Promise.all([availableAssetNamesAtom.get(), availableAssetNamesAtom.get()])

        expect(selector).toHaveBeenCalledTimes(2)
      })
    })

    describe('.observe', () => {
      let observer01
      let observer02

      beforeEach(async () => {
        observer01 = jest.fn()
        observer02 = jest.fn()
      })

      it('memoizes returned value', async () => {
        const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()
        availableAssetNamesAtom.observe(observer01)
        availableAssetNamesAtom.observe(observer02)

        await availableAssetsAtom.set(assets)

        await new Promise(setImmediate)
        expect(selector).toHaveBeenCalledTimes(1)
      })

      it('updates value on change', async () => {
        const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()
        availableAssetNamesAtom.observe(observer01)
        availableAssetNamesAtom.observe(observer02)

        const updated = assets.slice(1)
        await availableAssetsAtom.set(updated)

        await new Promise(setImmediate)
        expect(selector).toHaveBeenCalledTimes(1)
      })
    })
  })
})
