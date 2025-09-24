import assets from '@exodus/assets-base'

import { setup } from '../utils.js'

describe('enabledAssetsByWalletAccount', () => {
  it('should return enabled assets by walletAccount', () => {
    const {
      store,
      selectors,
      emitAvailableAssetNamesByWalletAccount,
      emitAssets,
      emitEnabledAssets,
    } = setup()

    emitAssets({
      bitcoin: assets.bitcoin,
      ethereum: assets.ethereum,
      solana: assets.solana,
    })
    emitEnabledAssets({
      bitcoin: true,
      ethereum: true,
      solana: false,
    })

    emitAvailableAssetNamesByWalletAccount({
      exodus_0: ['bitcoin', 'ethereum', 'solana'],
      exodus_1: ['ethereum', 'solana'],
    })

    expect(
      selectors.assetSources!.createEnabledAssetsByWalletAccount('exodus_0')(store.getState())
    ).toEqual(new Set(['bitcoin', 'ethereum']))

    expect(
      selectors.assetSources!.createEnabledAssetsByWalletAccount('exodus_1')(store.getState())
    ).toEqual(new Set(['ethereum']))
  })
})
