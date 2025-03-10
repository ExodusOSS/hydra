import { WalletAccount } from '@exodus/models'

export const types = {
  walletAccount: (value: WalletAccount) => WalletAccount.isInstance(value),
  assetSource: {
    assetName: 'String',
    walletAccount: 'String',
  },
  asset: 'Object',
}
