import { setup } from './utils.js'

describe('selectors.hardwareWallets.isAssetNameConnectedForWalletAccount', () => {
  it('should retrieve state', () => {
    const { store, selectors, emit } = setup()

    const walletAccountName = 'Wallet Account 1'
    emit({
      [walletAccountName]: ['bitcoin', 'ethereum'],
    })

    expect(
      selectors.hardwareWallets.isAssetNameConnectedForWalletAccount({
        walletAccountName,
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual(true)
    expect(
      selectors.hardwareWallets.isAssetNameConnectedForWalletAccount({
        walletAccountName,
        assetName: 'litecoin',
      })(store.getState())
    ).toEqual(false)
  })
})
