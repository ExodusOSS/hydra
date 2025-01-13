import createFetchival from '@exodus/fetch/create-fetchival'
// eslint-disable-next-line no-restricted-imports
import { fetch as exodusFetch } from '@exodus/fetch'

import {
  EXODUS_NFTS_PROXY_BASE_URL,
  Networks,
  SUPPORTED_EVM_NETWORKS,
  SUPPORTED_NETWORKS,
} from './constants.js'
import type {
  CanvasData,
  CollectionStats,
  FetchOptions,
  Nft,
  NftsByOwnerParams,
  NftsProxyApiParams,
  QueryParams,
  Transaction,
} from './types.js'
import { decomposeId } from './utils.js'

interface NftsProxyNetworkInterface {
  getNftsByOwner: (address: string, params?: NftsByOwnerParams) => Promise<Nft[]>
  getNft: (...args: any[]) => Promise<Nft>
  getNftImage: (...args: any[]) => Promise<CanvasData>
  getNftsTransactionsByAddress?: (address: string) => Promise<Transaction[]>
  getCollectionStats?: (args: {
    collectionSymbol?: string
    nftId: string
  }) => Promise<CollectionStats>
}

export class NftsProxyApi {
  readonly #fetchival
  readonly #baseUrl
  public readonly api: Record<string, NftsProxyNetworkInterface> = Object.create(null)

  /**
   * networks is the list of network names, using Networks as default for non breaking change. Wallet should provide their own list, e.g. ME's BE only cares about solana, ethereum and bitcoin.
   */
  public constructor(
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    { baseUrl, fetch = exodusFetch, networks = SUPPORTED_NETWORKS }: NftsProxyApiParams = {
      networks: SUPPORTED_NETWORKS,
    }
  ) {
    this.#fetchival = createFetchival({ fetch })
    this.#baseUrl = baseUrl || EXODUS_NFTS_PROXY_BASE_URL
    networks.forEach((network: string) => {
      this.api[network] = this._createNftProxyNetworkClient(network)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // so clients can keep calling like nftProxy.solana.getNftImage like it used to.
      this[network] = this.api[network] // @deprecated, use nftProxy.api.solana.getNftImage
    })
  }

  public request<T>(url: string, queryParams?: QueryParams, options?: FetchOptions): Promise<T> {
    return this.#fetchival(url, options).get(queryParams)
  }

  public getNetwork(nft: string | Nft): string {
    return typeof nft === 'string' ? nft.split(':')[0]! : nft.network
  }

  public isEvm(nft: string | Nft): boolean {
    const network = this.getNetwork(nft)
    return SUPPORTED_EVM_NETWORKS.includes(network)
  }

  public decomposeId(nftId: string): {
    network: string
    contractAddress?: string
    mintAddress?: string
    tokenId?: string
  } {
    const { idParts, ...decomposed } = decomposeId(nftId) // eslint-disable-line @typescript-eslint/no-unused-vars
    return decomposed
  }

  public getNft(nftId: string): Promise<Nft> {
    const { network, idParts } = decomposeId(nftId)
    return this.request(
      `${this.#baseUrl}/${encodeURIComponent(network)}/nfts/${idParts
        .map(encodeURIComponent)
        .join('/')}`
    )
  }

  public getNftImage(
    nftId: string,
    size: number,
    opts: { fetchQoi?: boolean }
  ): Promise<CanvasData> {
    const headers: Record<string, string> = {}
    if (opts.fetchQoi) {
      headers['Accept'] = 'image/qoi'
    }

    return this.request(this.getNftImageUrl(nftId, size, opts), {}, { headers })
  }

  public getNftImageUrl(
    nftId: string,
    size: number,
    { fetchQoi }: { fetchQoi?: boolean } = Object.create(null)
  ): string {
    const { network, idParts } = decomposeId(nftId)
    const params = [...idParts, Number(size)]

    const url = new URL(
      `${this.#baseUrl}/${encodeURIComponent(network)}/nfts/${params
        .map(encodeURIComponent)
        .join('/')}`
    )
    if (fetchQoi) {
      url.searchParams.append('qoi', 'true')
    }

    return url.toString()
  }

  private _createNftProxyNetworkClient(network: string): NftsProxyNetworkInterface {
    const encodedNetwork = encodeURIComponent(network)
    return {
      getNftsByOwner: (address: string, params: NftsByOwnerParams = {}): Promise<Nft[]> => {
        const encodedAddress = encodeURIComponent(address)
        const queryParams: QueryParams = Object.create(null)
        if (params.includeListed) {
          queryParams.includeListed = 'true'
        }

        if (params.includeSpam) {
          queryParams.includeSpam = 'true'
        }

        if (params.addVerifiedStatus) {
          queryParams.addVerifiedStatus = 'true'
        }

        if (params.includeCompressedOnSolana && network === Networks.Solana) {
          queryParams.includeCompressed = 'true'
        }

        if (params.includeT22OnSolana && network === Networks.Solana) {
          //   NO_TOKEN22_EXTENSION_TOKENS = 0, - Include all tokens
          //   VANILLA = 1, - Include only tokens that are vanilla standard
          //   WNS = 2, - Include tokens that are vanilla, and also WNS
          //   UNRECOGNIZED = -1,
          queryParams.token22StandardFilter = 1
        }

        return this.request(
          `${this.#baseUrl}/${encodedNetwork}/${encodedAddress}/nfts`,
          queryParams
        )
      },

      getNft: (...args: (string | number)[]): Promise<Nft> => {
        return this.request(
          `${this.#baseUrl}/${encodedNetwork}/nfts/${args.map(encodeURIComponent).join('/')}`
        )
      },

      getNftImage: (...args: (string | number)[]): Promise<CanvasData> => {
        return this.request(
          `${this.#baseUrl}/${encodedNetwork}/nfts/${args.map(encodeURIComponent).join('/')}`
        )
      },

      getNftsTransactionsByAddress: (address: string): Promise<Transaction[]> => {
        const encodedAddress = encodeURIComponent(address)
        return this.request(`${this.#baseUrl}/${encodedNetwork}/${encodedAddress}/transactions`)
      },

      getCollectionStats: ({
        collectionSymbol,
        nftId,
      }: {
        collectionSymbol?: string
        nftId: string
      }): Promise<CollectionStats> => {
        const { mintAddress, contractAddress, tokenId } = this.decomposeId(nftId)
        const address = (mintAddress || contractAddress || tokenId) as string
        const queryParams: QueryParams = {
          address: encodeURIComponent(address),
        }
        if (collectionSymbol) {
          queryParams.collectionSymbol = encodeURIComponent(collectionSymbol)
        }

        return this.request(`${this.#baseUrl}/${encodedNetwork}/collection-stats`, queryParams)
      },
    }
  }
}

export default NftsProxyApi
