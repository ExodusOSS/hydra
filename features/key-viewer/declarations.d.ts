declare module '@exodus/address-provider/utils' {
  import type { Asset } from './module/interfaces.js'
  import type { WalletAccount } from '@exodus/models'

  export function getDefaultPurpose(params: { asset: Asset; walletAccount: WalletAccount }): number
}

declare module '@exodus/asset-lib' {
  import type { Asset } from './module/interfaces.js'
  import type { WalletAccount } from '@exodus/models'

  export function getDefaultPathIndexes(params: {
    asset: Asset
    walletAccount: WalletAccount
    compatibilityMode?: string
  })
}

declare module '@exodus/address-provider/module'

declare module '@exodus/key-utils' {
  export function getSeedId(seed: Buffer): string
}

declare module '@exodus/bitcoin-plugin'
