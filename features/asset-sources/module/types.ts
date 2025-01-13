import { WalletAccount } from '@exodus/models'

export const types = {
  walletAccount: (value: WalletAccount) => value instanceof WalletAccount,
  assetSource: {
    assetName: 'String',
    walletAccount: 'String',
  },
  asset: 'Object',
}
