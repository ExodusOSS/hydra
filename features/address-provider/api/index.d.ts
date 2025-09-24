import type { Address } from '@exodus/models'

type AssetSource = { walletAccount: string; assetName: string }
type PathIndex = number

export interface AddressProviderApi {
  getAddress(
    params: {
      purpose: number
      chainIndex?: PathIndex
      addressIndex?: PathIndex
      useCache?: boolean
    } & AssetSource
  ): Promise<Address>
  getDefaultAddress(
    params: { purpose?: number; chainIndex?: PathIndex; useCache?: boolean } & AssetSource
  ): Promise<Address>
  getReceiveAddress(
    params: {
      purpose?: number
      useCache?: boolean
      multiAddressMode?: boolean
    } & AssetSource
  ): Promise<Address>
  getUnusedAddress(
    params: { purpose?: number; chainIndex?: PathIndex; useCache?: boolean } & AssetSource
  ): Promise<Address>
  isOwnAddress(
    params: {
      address: string
      chainIndex?: PathIndex
      purpose?: number
      useCache?: boolean
      multiAddressMode?: boolean
    } & AssetSource
  ): Promise<Address>
  getSupportedPurposes(params: AssetSource): Promise<string[]>
}

declare const addressProviderApiDefinition: {
  id: 'addressProviderApi'
  type: 'api'
  factory(): {
    addressProvider: AddressProviderApi
  }
}

export default addressProviderApiDefinition
