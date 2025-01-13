import { createInMemoryAtom } from '@exodus/atoms'
import availableAssetsApiDefinition from '../index.js'

describe('availableAssetsApi', () => {
  const assets = {
    bitcoin: {
      name: 'bitcoin',
      baseAssetName: 'bitcoin',
    },
    ethereum: {
      name: 'ethereum',
      baseAssetName: 'ethereum',
    },
  }

  let availableAssetNamesAtom
  let availableAssetsApi

  beforeEach(() => {
    availableAssetNamesAtom = createInMemoryAtom({ defaultValue: assets })
    availableAssetsApi = availableAssetsApiDefinition.factory({
      availableAssetNamesAtom,
    }).availableAssets
  })

  it('should get all available assets', async () => {
    await expect(availableAssetsApi.get()).resolves.toEqual(assets)
  })

  it('should reject all available assets', async () => {
    const error = new Error('Could not load available assets')
    jest.spyOn(availableAssetNamesAtom, 'get').mockRejectedValueOnce(error)

    await expect(availableAssetsApi.get()).rejects.toEqual(error)
  })
})
