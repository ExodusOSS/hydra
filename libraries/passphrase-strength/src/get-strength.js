import zxcvbn from 'zxcvbn'

export const getPassphraseStrength = (
  passphrase,
  { minimumValidScore = 2, minimumPassphraseLength = 8 } = {}
) => {
  const { score } = zxcvbn(passphrase)
  return {
    score,
    strong: score >= minimumValidScore && passphrase.length >= minimumPassphraseLength,
  }
}
