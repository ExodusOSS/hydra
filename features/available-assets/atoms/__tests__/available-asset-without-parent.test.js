import { baseAssets, combinedAssetsList } from '@exodus/assets-test-meta'
import { createInMemoryAtom } from '@exodus/atoms'

import { availableAssetNamesWithoutParentCombinedAtomDefinition } from '../index.js'

describe('availableAssetNamesWithoutParentCombinedAtom', () => {
  const { bitcoin } = baseAssets
  const combinedAsset = combinedAssetsList[0]
  const availableAssetNames = [bitcoin.name, combinedAsset.name]

  let assetsAtom
  let availableAssetNamesAtom
  let availableAssetNamesWithoutParentCombinedAtom

  beforeEach(() => {
    assetsAtom = createInMemoryAtom({
      defaultValue: {
        value: {
          [bitcoin.name]: { ...bitcoin, isCombined: false },
          [combinedAsset.name]: { ...combinedAsset, isCombined: true },
        },
      },
    })
    availableAssetNamesAtom = createInMemoryAtom({ defaultValue: availableAssetNames })
    availableAssetNamesWithoutParentCombinedAtom =
      availableAssetNamesWithoutParentCombinedAtomDefinition.factory({
        assetsAtom,
        availableAssetNamesAtom,
      })
  })

  it('should return non-combined assets only', async () => {
    await expect(availableAssetNamesWithoutParentCombinedAtom.get()).resolves.toEqual([
      bitcoin.name,
    ])
  })

  it('should reject when there was an error', async () => {
    const error = new Error('Could not load available assets')
    jest.spyOn(availableAssetNamesAtom, 'get').mockRejectedValueOnce(error)

    await expect(availableAssetNamesWithoutParentCombinedAtom.get()).rejects.toEqual(error)
  })
})
