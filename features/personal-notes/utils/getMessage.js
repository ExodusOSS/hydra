export const getMessage = ({ tx, personalNote }) => {
  if (!personalNote) return ''

  if (personalNote.sends) {
    const sends = Object.entries(personalNote.sends)

    // If tx.to exists, try to find exact match
    if (tx.to) {
      for (const [address, { message }] of sends) {
        if ((address === tx.to || address.toLowerCase() === tx.to) && message) return message
      }
    } else {
      // If tx.to is undefined (UTXO coins), return first available message
      for (const [, { message }] of sends) {
        if (message) return message
      }
    }
  }

  return personalNote.message || ''
}
