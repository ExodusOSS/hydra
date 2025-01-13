interface BaseFetchOptions {
  headers?: Record<string, string>
}

export type FetchOptions<T extends BaseFetchOptions = BaseFetchOptions> = T & {
  [key: string]: unknown
}

export type QueryParams = {
  [key: string]: number | string | undefined
}

export type FetchFunction = (url: string, options?: FetchOptions) => Promise<any>
export interface NftsProxyApiParams {
  networks?: string[]
  baseUrl?: string
  fetch?: FetchFunction
}

interface NftAttribute {
  trait: string
  value: string | number
}

export interface Nft {
  attributes?: NftAttribute[]
  collectionName: string
  collectionImage?: string
  contentType?: string
  description?: string
  id: string
  image: string
  name: string
  network: string
  number: number
  owner?: string
}

export interface Transaction {
  date: number
  from: string
  to: string
  txId: string
  nftId: string
  tokenId?: string
  contractAddress?: string
  tokenName?: string
}

export type CanvasData = {
  width: number
  height: number
  data: string
}

export interface CollectionStats {
  floorPrice: string
  totalVolume?: string
  owners?: number
  supply?: number
  totalListed?: number
}

export type NftsByOwnerParams = {
  includeListed?: boolean
  includeSpam?: boolean
  includeCompressedOnSolana?: boolean
  includeT22OnSolana?: boolean
  addVerifiedStatus?: boolean
}
