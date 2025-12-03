import { hash } from '@exodus/crypto/hash'
import { pbkdf2 } from '@exodus/crypto/pbkdf2'
import { randomBytes } from '@exodus/crypto/randomBytes'
import assert from 'minimalistic-assert'

import english from '../wordlists/english.js' // the only pre-loaded dictionary is the default one

// Entropy can be 16, 20, 24, 28 or 32 bytes (step: 4 bytes)
// Which is 128, 160, 192, 224 or 256 bits (step: 4 * 8 = 32 bits)
const BITLENGTH = new Set([128, 160, 192, 224, 256])

// Checksum is 1 bit per each 4 bytes, (32 bits -> 33 bits)
// Each 11 bits is a word (wordlist size is 2**11 == 2048)
// So each step is 3 words, and mnemonics can be 12, 15, 18, 21, or 24 words
const MNEMONICS = new Set([12, 15, 18, 21, 24])

// Internal methods

const nfkd = (str) => str.normalize('NFKD')

function toBinary(arr, width = 8) {
  return [...arr].map((x) => x.toString(2).padStart(width, '0')).join('')
}

function fromBinary(str, width = 8) {
  assert(typeof str === 'string' && str.length % width === 0 && /^[01]+$/u.test(str))
  const res = []
  for (let i = 0; i < str.length; i += width) res.push(parseInt(str.slice(i, i + width), 2))
  return res
}

const assertWordlist = (wordlist) => assert(Array.isArray(wordlist) && wordlist.length === 2048) // 2**11

function assertEntropy(entropy) {
  assert(entropy instanceof Uint8Array, 'Invalid entropy, must be an Uint8Array')
  assert(BITLENGTH.has(entropy.length * 8), 'Invalid entropy size')
}

async function getChecksum(entropy) {
  assertEntropy(entropy) // rechecks len % 4 === 0 and len <= 32, so we get right number of bits
  const h = await hash('sha256', entropy, 'uint8')
  const checksumBitsize = entropy.length / 4 // 1 bit checksum per 4 bytes, 33 bits checksumed per 32 bits raw
  // bits are always <= 8 as len <= 32, so we need only the first byte
  return { checksum: h[0] >>> (8 - checksumBitsize), checksumBitsize }
}

// Methods returning Uint8Array, Buffer, or hex

export async function mnemonicToSeed({
  mnemonic,
  password = '',
  validate = true,
  wordlist = english,
  format = 'uint8',
}) {
  assert(typeof mnemonic === 'string' && mnemonic.length > 0, 'mnemonic must be a non-empty string')
  assert(typeof password === 'string', 'password should be a string')
  if (validate) await mnemonicAssertValid({ mnemonic, wordlist })
  const salt = `mnemonic${nfkd(password)}`
  return pbkdf2('sha512', nfkd(mnemonic), salt, { iterations: 2048, dkLen: 64 }, format)
}

export async function mnemonicToEntropy({ mnemonic, wordlist = english, format = 'uint8' }) {
  if (wordlist !== english) assertWordlist(wordlist)
  assert(typeof mnemonic === 'string' && mnemonic.length > 0, 'mnemonic must be a non-empty string')
  const words = nfkd(mnemonic).split(' ')
  assert(MNEMONICS.has(words.length) && words.every((s) => !!s), 'Invalid mnemonic')
  const indexes = words.map((word) => {
    const index = wordlist.indexOf(word)
    assert(index >= 0, 'Invalid mnemonic')
    return index
  })

  // uses the same approach as https://www.npmjs.com/package/bip39, by first converting to bits then splitting
  // alternatively we could use an BigInt, but that would unlikely be faster or cleaner
  const bits = toBinary(indexes, 11) // bit string, 11 bits per word
  const entropyBitsize = (bits.length / 33) * 32 // 1/33 is checksum, 32/33 is entropy
  assert(BITLENGTH.has(entropyBitsize)) // coherence check, this should be always valid due to checked mnemonic
  const [entropyBits, checksumBits] = [bits.slice(0, entropyBitsize), bits.slice(entropyBitsize)] // split

  const entropy = new Uint8Array(fromBinary(entropyBits, 8))
  try {
    const { checksum } = await getChecksum(entropy) // asserts entropy shape
    assert(parseInt(checksumBits, 2) === checksum, 'Invalid mnemonic checksum')
  } catch (err) {
    entropy.fill(0)
    throw err
  }

  if (format === 'uint8') return entropy
  if (format === 'buffer' || format === 'hex') {
    const buffer = Buffer.from(entropy.buffer, entropy.byteOffset, entropy.length)
    if (format === 'buffer') return buffer
    const hex = buffer.toString('hex')
    entropy.fill(0)
    return hex
  }

  entropy.fill(0)
  if (format === 'null') return null // used for assertion
  throw new Error('Unexpected format')
}

// Validation

// unsafe against missing await, not exported
async function mnemonicAssertValid({ mnemonic, wordlist = english }) {
  await mnemonicToEntropy({ mnemonic, wordlist, format: 'null' })
}

// So we don't forget to await
export async function mnemonicIsInvalid({ mnemonic, wordlist = english }) {
  try {
    await mnemonicAssertValid({ mnemonic, wordlist })
    return false
  } catch {
    return true
  }
}

// Methods returning mnemonics

export async function entropyToMnemonic({ entropy, wordlist = english }) {
  if (wordlist !== english) assertWordlist(wordlist)
  const { checksum, checksumBitsize } = await getChecksum(entropy) // asserts entropy shape
  const bits = toBinary(entropy, 8) + toBinary([checksum], checksumBitsize)
  const words = fromBinary(bits, 11).map((index) => wordlist[index])
  // Ref: https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#japanese
  const isJapanese = wordlist[0] === '\u3042\u3044\u3053\u304F\u3057\u3093'
  return words.join(isJapanese ? '\u3000' : ' ')
}

export async function generateMnemonic({ bitsize, wordlist = english }) {
  assert(BITLENGTH.has(bitsize), 'Invalid bitsize')
  return entropyToMnemonic({ entropy: randomBytes(bitsize / 8), wordlist })
}

// Utility methods

export function wordlistHasWord({ word, wordlist = english }) {
  assert(typeof word === 'string', 'word should be a string')
  if (wordlist !== english) assertWordlist(wordlist)
  return wordlist.includes(nfkd(word))
}
