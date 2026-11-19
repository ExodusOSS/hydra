import type { AllowedBaseAssetNamesByWalletAccount } from './atoms/available-asset-names-by-wallet-account.js'

const allowedBaseAssetNamesByWalletAccount: AllowedBaseAssetNamesByWalletAccount = {}

const config = {
  delegatedAllowedAssetNames: ['solana', 'usdcoin_solana'],
  allowedBaseAssetNamesByWalletAccount,
}

export default config
