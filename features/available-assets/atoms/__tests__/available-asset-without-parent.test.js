import { createInMemoryAtom } from '@exodus/atoms'
import assetsBase from '@exodus/assets-base'
import { when } from 'jest-when'
import { availableAssetNamesWithoutParentCombinedAtomDefinition } from '../index.js'

describe('availableAssetNamesWithoutParentCombinedAtom', () => {
  const { bitcoin, eden } = assetsBase
  const availableAssetNames = [bitcoin.name, eden.name]

  let assetsModule
  let availableAssetNamesAtom
  let availableAssetNamesWithoutParentCombinedAtom

  beforeEach(() => {
    assetsModule = {
      getAsset: jest.fn(),
    }
    when(assetsModule.getAsset)
      .calledWith(bitcoin.name)
      .mockReturnValue({ ...bitcoin, isCombined: false })
    when(assetsModule.getAsset)
      .calledWith(eden.name)
      .mockReturnValue({ ...eden, isCombined: true })

    availableAssetNamesAtom = createInMemoryAtom({ defaultValue: availableAssetNames })
    availableAssetNamesWithoutParentCombinedAtom =
      availableAssetNamesWithoutParentCombinedAtomDefinition.factory({
        assetsModule,
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
