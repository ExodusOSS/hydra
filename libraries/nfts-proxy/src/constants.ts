export const EXODUS_NFTS_PROXY_BASE_URL = 'https://nfts-proxy.exodus.io/v2'

export const Networks = {
  Algorand: 'algorand',
  Avalanche: 'avalanche',
  Bitcoin: 'bitcoin',
  Bnb: 'bnb',
  Cardano: 'cardano',
  Ethereum: 'ethereum',
  Fantom: 'fantom',
  Polygon: 'polygon',
  Solana: 'solana',
  Tezos: 'tezos',
  Base: 'base',
}

export const SUPPORTED_NETWORKS = Object.values(Networks)

export const SUPPORTED_EVM_NETWORKS = [
  Networks.Avalanche,
  Networks.Bnb,
  Networks.Ethereum,
  Networks.Fantom,
  Networks.Polygon,
  Networks.Base,
]
