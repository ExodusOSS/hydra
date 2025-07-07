import { areAddressesEqual } from '../../utils.js'

export const decomposeId = (composedId = '', separator = '') => composedId.split(separator)

export const isSentTx = ({ tx, network }) => {
  if (areAddressesEqual(tx.ownerAddress, tx.to, { network })) return false
  if (areAddressesEqual(tx.ownerAddress, tx.from, { network })) return true
}
