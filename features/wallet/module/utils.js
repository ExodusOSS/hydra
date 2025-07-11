import { randomBytes } from '@exodus/crypto/randomBytes'
import { mnemonicIsInvalid } from '@exodus/bip39'
import assert from 'minimalistic-assert'

export const genPassphrase = () => randomBytes(32).toString('base64')

export class NamedError extends Error {
  constructor({ name, message }) {
    super(message)
    this.name = name
  }
}

export const assertMnemonic = async (input, validMnemonicLengths) => {
  assert(typeof input === 'string', 'The secret phrase provided is not a string')

  if (!validMnemonicLengths.includes(input.split(/\s+/gu).length)) {
    throw new NamedError({ name: 'UnexpectedWordCount' })
  }

  if (await mnemonicIsInvalid({ mnemonic: input })) {
    throw new NamedError({ name: 'InvalidPhrase' })
  }
}
