export const getMessage = ({ tx, personalNote }) => {
  if (!personalNote) return ''

  if (tx.to && personalNote.sends) {
    for (const [address, { message }] of Object.entries(personalNote.sends)) {
      if (address.toLowerCase() === tx.to.toLowerCase() && message) {
        return message
      }
    }
  }

  if (personalNote.message) return personalNote.message

  if (!tx.to && personalNote.sends) {
    for (const [, { message }] of Object.entries(personalNote.sends)) {
      if (message) return message
    }
  }

  return ''
}
