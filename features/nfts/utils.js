import { NFTS_EVM_NETWORKS } from './constants'

export const areAddressesEqual = (a, b, { network }) => {
  const isEvm = NFTS_EVM_NETWORKS.includes(network)
  if (isEvm) {
    return a?.toLowerCase() === b?.toLowerCase()
  }

  return a === b
}
