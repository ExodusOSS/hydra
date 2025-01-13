import invert from 'lodash/invert'

export const Networks = {
  __proto__: null,
  algorand: 'algorand',
  avalanche: 'avalanche',
  bitcoin: 'bitcoin',
  bnb: 'bnb',
  cardano: 'cardano',
  ethereum: 'ethereum',
  fantom: 'fantom',
  polygon: 'polygon',
  solana: 'solana',
  tezos: 'tezos',
  base: 'base',
}

export const NFTS_NETWORK_TO_ASSET_NAME = {
  __proto__: null,
  [Networks.algorand]: 'algorand',
  [Networks.avalanche]: 'avalanchec',
  [Networks.bitcoin]: 'bitcoin',
  [Networks.bnb]: 'bsc',
  [Networks.cardano]: 'cardano',
  [Networks.ethereum]: 'ethereum',
  [Networks.fantom]: 'fantommainnet',
  [Networks.polygon]: 'matic',
  [Networks.solana]: 'solana',
  [Networks.tezos]: 'tezos',
  [Networks.base]: 'basemainnet',
}

export const NFTS_EVM_NETWORKS = [
  Networks.avalanche,
  Networks.bnb,
  Networks.ethereum,
  Networks.fantom,
  Networks.polygon,
  Networks.base,
]

export const NFTS_NETWORKS_WAIT_RESTORE_COMPLETE = [Networks.bitcoin]

export const ASSET_NAME_TO_NFTS_NETWORK = Object.assign(
  Object.create(null),
  invert(NFTS_NETWORK_TO_ASSET_NAME)
)

export const DEFAULT_CONFIGS = {
  sandbox: {
    baseUrl: 'https://nfts-proxy-d.exodus.io/v2',
  },
  production: {
    baseUrl: 'https://nfts-proxy.exodus.io/v2',
  },
}
