import { createInMemoryAtom } from '@exodus/atoms'

import createAvailableAssetNamesAtom from '../available-asset-names/factory.js'

const setup = async () => {
  const assets = [
    { assetName: 'bitcoin', reason: 'default' },
    { assetName: 'ethereum', reason: 'default' },
  ]
  const availableAssetsAtom = createInMemoryAtom()
  const availableAssetNamesAtom = createAvailableAssetNamesAtom({ availableAssetsAtom })

  await availableAssetsAtom.set(assets)

  return { assets, availableAssetsAtom, availableAssetNamesAtom }
}

describe('availableAssetNamesAtom', () => {
  describe('.get', () => {
    it('returns derived asset names', async () => {
      const { availableAssetNamesAtom } = await setup()

      await expect(availableAssetNamesAtom.get()).resolves.toEqual(['bitcoin', 'ethereum'])
    })

    it('returns the same reference while the names are unchanged', async () => {
      const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()

      const first = await availableAssetNamesAtom.get()
      await availableAssetsAtom.set([...assets])
      const second = await availableAssetNamesAtom.get()

      expect(second).toBe(first)
    })

    it('returns a new value when assets are added', async () => {
      const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()

      const first = await availableAssetNamesAtom.get()
      await availableAssetsAtom.set([...assets, { assetName: 'solana', reason: 'assets-load' }])
      const second = await availableAssetNamesAtom.get()

      expect(second).not.toBe(first)
      expect(second).toEqual(['bitcoin', 'ethereum', 'solana'])
    })

    it('returns a new value when assets are removed', async () => {
      const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()

      const first = await availableAssetNamesAtom.get()
      await availableAssetsAtom.set(assets.slice(1))
      const second = await availableAssetNamesAtom.get()

      expect(second).not.toBe(first)
      expect(second).toEqual(['ethereum'])
    })
  })

  describe('.observe', () => {
    it('does not re-notify for an equivalent value', async () => {
      const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()
      const observer = jest.fn()
      availableAssetNamesAtom.observe(observer)
      await new Promise(setImmediate)

      await availableAssetsAtom.set([...assets])
      await new Promise(setImmediate)

      expect(observer).toHaveBeenCalledTimes(1)
      expect(observer).toHaveBeenCalledWith(['bitcoin', 'ethereum'])
    })

    it('notifies with the new value on change', async () => {
      const { availableAssetsAtom, availableAssetNamesAtom, assets } = await setup()
      const observer = jest.fn()
      availableAssetNamesAtom.observe(observer)
      await new Promise(setImmediate)

      await availableAssetsAtom.set([...assets, { assetName: 'solana', reason: 'assets-load' }])
      await new Promise(setImmediate)

      expect(observer).toHaveBeenLastCalledWith(['bitcoin', 'ethereum', 'solana'])
    })
  })
})
