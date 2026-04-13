import type { Address } from '@exodus/models'

export declare class AddressProvider {
  getReceiveAddress(params: {
    assetName: string
    walletAccount: WalletAccount
    purpose?: string
    useCache?: boolean
    multiAddressMode?: boolean
  }): Promise<Address>
}
