import ecc from '@exodus/bitcoinerlab-secp256k1'
import * as bitcoin from '@exodus/bitcoinjs'
import * as bitcoinMessage from 'bitcoinjs-message'

import Address from '../../src/Address.js'
import BIP322 from '../../src/BIP322.js'
import { decodeScriptSignature } from './bitcoinjs/DecodeScriptSignature.js'
import BIP137 from './helpers/BIP137.js'

/**
 * Class that handles BIP-322 signature verification.
 * Reference: https://github.com/LegReq/bip0322-signatures/blob/master/BIP0322_verification.ipynb
 */
class Verifier {
  /**
   * Verify a BIP-322 signature from P2WPKH, P2SH-P2WPKH, and single-key-spend P2TR address.
   * @param signerAddress Address of the signing address
   * @param message message_challenge signed by the address
   * @param signatureBase64 Signature produced by the signing address
   * @returns True if the provided signature is a valid BIP-322 signature for the given message and address, false if otherwise
   * @throws If the provided signature fails basic validation, or if unsupported address and signature are provided
   */
  public static verifySignature(signerAddress: string, message: string, signatureBase64: string) {
    // Handle legacy BIP-137 signature
    // For P2PKH address, assume the signature is also a legacy signature
    if (Address.isP2PKH(signerAddress) || BIP137.isBIP137Signature(signatureBase64)) {
      return this.verifyBIP137Signature(signerAddress, message, signatureBase64)
    }

    // Convert address into corresponding script pubkey
    const scriptPubKey = Address.convertAdressToScriptPubkey(signerAddress)
    // Draft corresponding toSpend and toSign transaction using the message and script pubkey
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey)
    const toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey)
    // Add the witness stack into the toSignTx
    toSignTx.updateInput(0, {
      finalScriptWitness: Buffer.from(signatureBase64, 'base64'),
    })
    // Obtain the signature within the witness components
    const witness = toSignTx.extractTransaction().ins[0]!.witness
    const encodedSignature = witness[0]!
    // Branch depending on whether the signing address is a non-taproot or a taproot address
    if (Address.isP2WPKHWitness(witness)) {
      // For non-taproot segwit transaciton, public key is included as the second part of the witness data
      const publicKey = witness[1]!
      const { signature } = decodeScriptSignature(encodedSignature)
      // Compute OP_HASH160(publicKey)
      const hashedPubkey = bitcoin.crypto.hash160(publicKey)
      // Common path variable
      let hashToSign: Buffer // Hash expected to be signed by the signing address
      if (Address.isP2SH(signerAddress)) {
        // P2SH-P2WPKH verification path
        // Compute the hash that correspond to the toSignTx
        hashToSign = this.getHashForSigP2SHInP2WPKH(toSignTx, hashedPubkey)
        // The original locking script for P2SH-P2WPKH is OP_0 <PubKeyHash>
        const lockingScript = Buffer.concat([Buffer.from([0x00, 0x14]), hashedPubkey])
        // Compute OP_HASH160(lockingScript)
        const hashedLockingScript = bitcoin.crypto.hash160(lockingScript)
        // For nested segwit (P2SH-P2WPKH) address, the hashed locking script is located from the 3rd byte to the last 2nd byte as OP_HASH160 <HASH> OP_EQUAL
        const hashedLockingScriptInScriptPubKey = scriptPubKey.subarray(2, -1)
        // Check if the P2SH locking script OP_HASH160 <HASH> OP_EQUAL is satisified
        if (Buffer.compare(hashedLockingScript, hashedLockingScriptInScriptPubKey) !== 0) {
          return false // Reject signature if the hashed locking script is different from the hashed locking script in the scriptPubKey
        }
      } else {
        // P2WPKH verification path
        // Compute the hash that correspond to the toSignTx
        hashToSign = this.getHashForSigP2WPKH(toSignTx)
        // For native segwit address, the hashed public key is located from the 3rd to the end as OP_0 <HASH>
        const hashedPubkeyInScriptPubkey = scriptPubKey.subarray(2)
        // Check if OP_HASH160(publicKey) === hashedPubkeyInScriptPubkey
        if (Buffer.compare(hashedPubkey, hashedPubkeyInScriptPubkey) !== 0) {
          return false // Reject signature if the hashed public key did not match
        }
      }

      // Computing OP_CHECKSIG in Javascript
      return ecc.verify(hashToSign, publicKey, signature)
    }

    if (Address.isP2TR(signerAddress)) {
      // Check if the witness stack correspond to a single-key-spend P2TR address
      if (!Address.isSingleKeyP2TRWitness(witness)) {
        throw new Error('BIP-322 verification from script-spend P2TR is unsupported.')
      }

      // For taproot address, the public key is located starting from the 3rd byte of the script public key
      const publicKey = scriptPubKey.subarray(2)
      // Compute the hash to be signed by the signing address
      // Reference: https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#user-content-Taproot_key_path_spending_signature_validation
      let hashToSign: Buffer
      let signature: Buffer
      if (encodedSignature.byteLength === 64) {
        // If a BIP-341 signature is 64 bytes, the signature is signed using SIGHASH_DEFAULT 0x00
        hashToSign = this.getHashForSigP2TR(toSignTx, 0x00)
        // And the entirety of the encoded signature is the actual signature
        signature = encodedSignature
      } else if (encodedSignature.byteLength === 65) {
        // If a BIP-341 signature is 65 bytes, the signature is signed using SIGHASH included at the last byte of the signature
        hashToSign = this.getHashForSigP2TR(toSignTx, encodedSignature[64]!)
        // And encodedSignature[0:64] holds the actual signature
        signature = encodedSignature.subarray(0, -1)
      } else {
        // Fail validation if the signature is not 64 or 65 bytes
        throw new Error('Invalid Schnorr signature provided.')
      }

      // Computing OP_CHECKSIG in Javascript
      return ecc.verifySchnorr(hashToSign, publicKey, signature)
    }

    throw new Error(
      'Only P2WPKH, P2SH-P2WPKH, and single-key-spend P2TR BIP-322 verification is supported. Unsupported address is provided.'
    )
  }

  /**
   * Verify a legacy BIP-137 signature.
   * Note that a signature is considered valid for all types of addresses that can be derived from the recovered public key.
   * @param signerAddress Address of the signing address
   * @param message message_challenge signed by the address
   * @param signatureBase64 Signature produced by the signing address
   * @returns True if the provided signature is a valid BIP-137 signature for the given message and address, false if otherwise
   * @throws If the provided signature fails basic validation, or if unsupported address and signature are provided
   */
  private static verifyBIP137Signature(
    signerAddress: string,
    message: string,
    signatureBase64: string
  ) {
    if (Address.isP2PKH(signerAddress)) {
      return bitcoinMessage.verify(message, signerAddress, signatureBase64)
    }

    // Recover the public key associated with the signature
    const publicKeySigned = BIP137.derivePubKey(message, signatureBase64)
    // Set the equivalent legacy address to prepare for validation from bitcoinjs-message
    const legacySigningAddress = Address.convertPubKeyIntoAddress(publicKeySigned, 'p2pkh').mainnet
    // Make sure that public key recovered corresponds to the claimed signing address
    if (Address.isP2SH(signerAddress)) {
      // Assume it is a P2SH-P2WPKH address, derive a P2SH-P2WPKH address based on the public key recovered
      const p2shAddressDerived = Address.convertPubKeyIntoAddress(publicKeySigned, 'p2sh-p2wpkh')
      // Assert that the derived address is identical to the claimed signing address
      if (
        p2shAddressDerived.mainnet !== signerAddress &&
        p2shAddressDerived.testnet !== signerAddress
      ) {
        return false // Derived address did not match with the claimed signing address
      }
    } else if (Address.isP2WPKH(signerAddress)) {
      // Assume it is a P2WPKH address, derive a P2WPKH address based on the public key recovered
      const p2wpkhAddressDerived = Address.convertPubKeyIntoAddress(publicKeySigned, 'p2wpkh')
      // Assert that the derived address is identical to the claimed signing address
      if (
        p2wpkhAddressDerived.mainnet !== signerAddress &&
        p2wpkhAddressDerived.testnet !== signerAddress
      ) {
        return false // Derived address did not match with the claimed signing address
      }
    } else if (Address.isP2TR(signerAddress)) {
      // Assume it is a P2TR address, derive a P2TR address based on the public key recovered
      const p2trAddressDerived = Address.convertPubKeyIntoAddress(publicKeySigned, 'p2tr')
      // Assert that the derived address is identical to the claimed signing address
      if (
        p2trAddressDerived.mainnet !== signerAddress &&
        p2trAddressDerived.testnet !== signerAddress
      ) {
        return false // Derived address did not match with the claimed signing address
      }
    } else {
      return false // Unsupported address type
    }

    // Validate the signature using bitcoinjs-message if address assertion succeeded
    return bitcoinMessage.verify(message, legacySigningAddress!, signatureBase64)
  }

  /**
   * Compute the hash to be signed for a given P2WPKH BIP-322 toSign transaction.
   * @param toSignTx PSBT instance of the toSign transaction
   * @returns Computed transaction hash that requires signing
   */
  private static getHashForSigP2WPKH(toSignTx: bitcoin.Psbt) {
    // Create a signing script to unlock the P2WPKH output based on the P2PKH template
    // Reference: https://github.com/bitcoinjs/bitcoinjs-lib/blob/1a9119b53bcea4b83a6aa8b948f0e6370209b1b4/ts_src/psbt.ts#L1654
    const signingScript = bitcoin.payments.p2pkh({
      hash: toSignTx.data.inputs[0]!.witnessUtxo!.script.subarray(2),
    }).output
    // Return computed transaction hash to be signed
    return toSignTx
      .extractTransaction()
      .hashForWitnessV0(0, signingScript!, 0, bitcoin.Transaction.SIGHASH_ALL)
  }

  /**
   * Compute the hash to be signed for a given P2SH-P2WPKH BIP-322 toSign transaction.
   * @param toSignTx PSBT instance of the toSign transaction
   * @param hashedPubkey Hashed public key of the signing address
   * @returns Computed transaction hash that requires signing
   */
  private static getHashForSigP2SHInP2WPKH(toSignTx: bitcoin.Psbt, hashedPubkey: Buffer) {
    // Create a signing script to unlock the P2WPKH output based on the P2PKH template
    // Reference: https://github.com/bitcoinjs/bitcoinjs-lib/blob/1a9119b53bcea4b83a6aa8b948f0e6370209b1b4/ts_src/psbt.ts#L1654
    // Like P2WPKH, the hash for deriving the meaningfulScript for a P2SH-P2WPKH transaction is its public key hash
    // It can be derived by hashing the provided public key in the witness stack
    const signingScript = bitcoin.payments.p2pkh({
      hash: hashedPubkey,
    }).output
    // Return computed transaction hash to be signed
    return toSignTx
      .extractTransaction()
      .hashForWitnessV0(0, signingScript!, 0, bitcoin.Transaction.SIGHASH_ALL)
  }

  /**
   * Compute the hash to be signed for a given P2TR BIP-322 toSign transaction.
   * @param toSignTx PSBT instance of the toSign transaction
   * @param hashType Hash type used to sign the toSign transaction, must be either 0x00 or 0x01
   * @returns Computed transaction hash that requires signing
   * @throws Error if hashType is anything other than 0x00 or 0x01
   */
  private static getHashForSigP2TR(toSignTx: bitcoin.Psbt, hashType: number) {
    // BIP-322 states that 'all signatures must use the SIGHASH_ALL flag'
    // But, in BIP-341, SIGHASH_DEFAULT (0x00) is equivalent to SIGHASH_ALL (0x01) so both should be allowed
    if (
      hashType !== bitcoin.Transaction.SIGHASH_DEFAULT &&
      hashType !== bitcoin.Transaction.SIGHASH_ALL
    ) {
      // Throw error if hashType is neither SIGHASH_DEFAULT or SIGHASH_ALL
      throw new Error(
        'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
      )
    }

    // Return computed transaction hash to be signed
    return toSignTx
      .extractTransaction()
      .hashForWitnessV1(0, [toSignTx.data.inputs[0]!.witnessUtxo!.script], [0], hashType)
  }
}

export default Verifier
