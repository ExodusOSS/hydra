import * as bitcoinMessage from '@exodus/bitcoinjs/message'
import { secp256k1 } from '@noble/curves/secp256k1.js'

/**
 * Class that implement BIP137-related utility functions.
 */
class BIP137 {
  /**
   * Check if a given signature satisified the format of a BIP-137 signature.
   * @param signature Signature buffer to be checked
   * @returns True if the provided signature correspond to a valid BIP-137 signature, false if otherwise
   */
  public static isBIP137Signature(signature: Buffer) {
    return signature.byteLength === 65
  }

  /**
   * Derive the public key that signed a valid BIP-137 signature.
   * @param message Message signed by the signature
   * @param signature Signature buffer to be decoded
   * @returns Public key that signs the provided signature
   */
  public static derivePubKey(message: string, signature: Buffer) {
    const messageHash = bitcoinMessage.magicHash(message)
    const signatureDecoded = this.#decodeSignature(signature)
    const recoveredPublicKey = secp256k1.Signature.fromBytes(signatureDecoded.signature, 'compact')
      .addRecoveryBit(signatureDecoded.recovery)
      .recoverPublicKey(messageHash)
      .toBytes(signatureDecoded.compressed)
    return Buffer.from(recoveredPublicKey)
  }

  /**
   * Decode a BIP-137 signature.
   * Function copied from bitcoinjs-message library.
   * @param signature BIP-137 signature to be decoded
   * @returns Decoded BIP-137 signature
   */
  static #decodeSignature(signature: Buffer) {
    if (signature.length !== 65) throw new Error('Invalid signature length')
    const flagByte = signature.readUInt8(0) - 27
    if (flagByte > 15 || flagByte < 0) {
      throw new Error('Invalid signature parameter')
    }

    return {
      compressed: !!(flagByte & 12),
      recovery: flagByte & 3,
      signature: signature.subarray(1),
    }
  }
}

export default BIP137
