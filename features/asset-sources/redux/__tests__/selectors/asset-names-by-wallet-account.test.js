import { setup } from '../utils.js'

describe('assetNamesByWalletAccount', () => {
  it('should return available assets by walletAccount', () => {
    const { store, selectors, emitAvailableAssetNamesByWalletAccount } = setup()

    emitAvailableAssetNamesByWalletAccount({
      exodus_0: ['bitcoin', 'ethereum', 'solana'],
      trezor_0_123: ['bitcoin', 'ethereum'],
    })

    expect(selectors.assetSources.availableAssetNamesByWalletAccount(store.getState())).toEqual({
      exodus_0: new Set(['bitcoin', 'ethereum', 'solana']),
      trezor_0_123: new Set(['bitcoin', 'ethereum']),
    })
  })
})
