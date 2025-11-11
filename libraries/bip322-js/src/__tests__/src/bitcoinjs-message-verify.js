import { hashSync } from '@exodus/crypto/hash'
import { recoverPublicKey } from '@noble/secp256k1'
import bech32 from 'bech32'
import bs58check from 'bs58check'
import bufferEquals from 'buffer-equals'
import varuint from 'varuint-bitcoin'

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)',
}

const hash256 = (buffer) => hashSync('sha256', hashSync('sha256', buffer), 'buffer')
const hash160 = (buffer) => hashSync('hash160', buffer, 'buffer')

function decodeSignature(buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) throw new Error('Invalid signature parameter')

  return {
    compressed: !!(flagByte & 12),
    segwitType:
      flagByte & 8 ? (flagByte & 4 ? SEGWIT_TYPES.P2WPKH : SEGWIT_TYPES.P2SH_P2WPKH) : null,
    recovery: flagByte & 3,
    signature: buffer.slice(1),
  }
}

function magicHash(message, messagePrefix = '\u0018Bitcoin Signed Message:\n') {
  if (!Buffer.isBuffer(messagePrefix)) messagePrefix = Buffer.from(messagePrefix, 'utf8')
  if (!Buffer.isBuffer(message)) message = Buffer.from(message, 'utf8')
  const messageVISize = varuint.encodingLength(message.length)
  const buffer = Buffer.allocUnsafe(messagePrefix.length + messageVISize + message.length)
  messagePrefix.copy(buffer, 0)
  varuint.encode(message.length, buffer, messagePrefix.length)
  message.copy(buffer, messagePrefix.length + messageVISize)
  return hash256(buffer)
}

function segwitRedeemHash(publicKeyHash) {
  const redeemScript = Buffer.concat([Buffer.from('0014', 'hex'), publicKeyHash])
  return hash160(redeemScript)
}

function decodeBech32(address) {
  const result = bech32.decode(address)
  const data = bech32.fromWords(result.words.slice(1))
  return Buffer.from(data)
}

export function verify(message, address, signature, messagePrefix, checkSegwitAlways) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

  const parsed = decodeSignature(signature)

  if (checkSegwitAlways && !parsed.compressed) {
    throw new Error(
      'checkSegwitAlways can only be used with a compressed pubkey signature flagbyte'
    )
  }

  const hash = magicHash(message, messagePrefix)
  const publicKey = Buffer.from(
    recoverPublicKey(hash, parsed.signature, parsed.recovery, parsed.compressed)
  )
  const publicKeyHash = hash160(publicKey)
  let actual, expected

  if (parsed.segwitType) {
    if (parsed.segwitType === SEGWIT_TYPES.P2SH_P2WPKH) {
      actual = segwitRedeemHash(publicKeyHash)
      expected = Buffer.from(bs58check.decode(address).slice(1))
    } else {
      // parsed.segwitType === SEGWIT_TYPES.P2WPKH
      // must be true since we only return null, P2SH_P2WPKH, or P2WPKH
      // from the decodeSignature function.
      actual = publicKeyHash
      expected = decodeBech32(address)
    }
  } else if (checkSegwitAlways) {
    try {
      expected = decodeBech32(address)
      // if address is bech32 it is not p2sh
      return bufferEquals(publicKeyHash, expected)
    } catch {
      const redeemHash = segwitRedeemHash(publicKeyHash)
      expected = Buffer.from(bs58check.decode(address).slice(1))
      // base58 can be p2pkh or p2sh-p2wpkh
      return bufferEquals(publicKeyHash, expected) || bufferEquals(redeemHash, expected)
    }
  } else {
    actual = publicKeyHash
    expected = Buffer.from(bs58check.decode(address).slice(1))
  }

  return bufferEquals(actual, expected)
}
