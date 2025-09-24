import { bitcoin, ethereum, setup, usdcoinSolana } from '../utils.js'

describe('assetNamesByWalletAccount', () => {
  it('should return available assets by walletAccount', () => {
    const { store, selectors, emitAvailableAssetNamesByWalletAccount } = setup()

    emitAvailableAssetNamesByWalletAccount({
      exodus_0: [bitcoin.name, ethereum.name, usdcoinSolana.name],
      trezor_0_123: [bitcoin.name, ethereum.name],
    })

    expect(selectors.availableAssets.assetNamesByWalletAccount(store.getState())).toEqual({
      exodus_0: new Set([bitcoin.name, ethereum.name, usdcoinSolana.name]),
      trezor_0_123: new Set([bitcoin.name, ethereum.name]),
    })
  })
})
