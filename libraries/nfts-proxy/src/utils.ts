import { Networks, SUPPORTED_EVM_NETWORKS } from './constants.js'

export function decomposeId(nftId: string): {
  network: string
  contractAddress?: string
  mintAddress?: string
  tokenId?: string
  idParts: string[]
} {
  const [network, pseudoId] = nftId.split(':') as [string, string]
  const idParts = pseudoId.split('/')

  if (SUPPORTED_EVM_NETWORKS.includes(network) || network === Networks.Tezos) {
    const [contractAddress, tokenId] = idParts
    return { network, contractAddress, tokenId, idParts }
  }

  if (network === Networks.Algorand) {
    return { network, tokenId: pseudoId, idParts }
  }

  if (network === Networks.Solana) {
    return { network, mintAddress: pseudoId, idParts }
  }

  if (network === Networks.Cardano) {
    return { network, tokenId: pseudoId, idParts }
  }

  if (network === Networks.Bitcoin) {
    return { network, tokenId: pseudoId, idParts }
  }

  throw new Error('NftsProxyApi.decomposeId: Unknown network')
}
