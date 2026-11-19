import { WalletAccount } from '@exodus/models'

import { doesWalletAccountSupportNFTs } from '../utils.js'

describe('doesWalletAccountSupportNFTs', () => {
  it('supports regular software accounts', () => {
    expect(doesWalletAccountSupportNFTs(WalletAccount.DEFAULT)).toBe(true)
  })

  it('does not support delegated software accounts', () => {
    const walletAccount = new WalletAccount({
      source: WalletAccount.EXODUS_SRC,
      index: 1,
      delegated: true,
    })

    expect(doesWalletAccountSupportNFTs(walletAccount)).toBe(false)
  })
})
