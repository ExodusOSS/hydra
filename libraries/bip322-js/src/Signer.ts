import Address from './Address.js'
import BIP322 from './BIP322.js'
import type { SignerAsync } from '@exodus/bitcoinjs'
import * as bitcoin from '@exodus/bitcoinjs'
import * as bitcoinMessage from '@exodus/bitcoinjs/message'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import { hash } from '@exodus/crypto/hash'
import assert from 'minimalistic-assert'
import wif from 'wif'
import type { Signer as AssetSigner } from '@exodus/asset-types/src/signer'

type ToAsyncSignerParams = {
  publicKey: Buffer
  signatureType?: 'ecdsa' | 'schnorr'
  tweak?: Buffer
  signer: AssetSigner
}

// Create AssetSigner from a private key buffer or wif
// Only supports usage from this file
// Exported for testing only, not present in index.js
export const createSigner = (encodedKey: string | Buffer, network: bitcoin.Network) => {
  let decoded
  if (typeof encodedKey === 'string') {
    decoded = wif.decode(encodedKey)
    const version = decoded.version
    if (version !== network.wif) throw new Error('Invalid network version')
  } else {
    decoded = { privateKey: encodedKey, compressed: true }
  }

  const { privateKey, compressed } = decoded // privateKey might be Uint8Array, that is fine
  const publicKey = secp256k1.privateKeyToPublicKey({ privateKey, compressed, format: 'buffer' })

  const tweakPrivateKey = (tweak) =>
    secp256k1.privateKeyTweakAdd({
      privateKey: publicKey[0] === 3 ? secp256k1.privateKeyTweakNegate({ privateKey }) : privateKey,
      tweak,
    })

  const signer = {
    getPublicKey: async () => publicKey,
    sign: async ({ data, signatureType, enc, tweak, extraEntropy = null }) => {
      if (signatureType === 'schnorr') {
        return secp256k1.schnorrSign({
          data,
          privateKey: tweak ? tweakPrivateKey(tweak) : privateKey,
          extraEntropy,
          format: 'buffer',
        })
      }

      assert(signatureType === 'ecdsa')
      assert(enc === 'sig' || enc === 'sig,rec')
      return secp256k1.ecdsaSignHash({
        hash: data,
        privateKey,
        extraEntropy,
        recovery: enc !== 'sig',
        format: 'buffer',
      })
    },
  }

  return { signer, compressed }
}

// Convert AssetSigner to PSBT/bitcoinMessage async signer
const createAsyncSigner = ({ signer, publicKey, tweak }: ToAsyncSignerParams): SignerAsync => ({
  publicKey,
  getPublicKey: () => publicKey,
  sign: async (data: Buffer) => signer.sign({ signatureType: 'ecdsa', data, enc: 'sig' }),
  signSchnorr: async (hash: Buffer) => signer.sign({ signatureType: 'schnorr', data: hash, tweak }),
})

/**
 * Class that signs BIP-322 signature using a private key.
 * Reference: https://github.com/LegReq/bip0322-signatures/blob/master/BIP0322_signing.ipynb
 */
class Signer {
  /**
   * Sign a BIP-322 signature from P2WPKH, P2SH-P2WPKH, and single-key-spend P2TR address and its corresponding private key.
   * @param signerOrKey
   * @param address Address to be signing the message
   * @param message message_challenge to be signed by the address
   * @param network Network that the address is located, defaults to the Bitcoin mainnet
   * @returns BIP-322 simple signature, encoded in base-64
   */
  public static async signAsync(
    signerOrKey: string | Buffer | AssetSigner,
    address: string,
    message: string,
    network: bitcoin.Network = bitcoin.networks.bitcoin
  ) {
    if (typeof signerOrKey === 'string' || Buffer.isBuffer(signerOrKey)) {
      const { signer, compressed } = createSigner(signerOrKey, network)
      return this.#signAsyncInternal(signer as AssetSigner, address, message, network, compressed)
    }

    return this.#signAsyncInternal(signerOrKey, address, message, network, true)
  }

  static async #signAsyncInternal(
    signer: AssetSigner,
    address: string,
    message: string,
    network: bitcoin.Network = bitcoin.networks.bitcoin,
    compressed: boolean
  ) {
    const publicKey = await signer.getPublicKey()

    assert(
      this.checkPubKeyCorrespondToAddress(publicKey, address),
      `Invalid signer for address "${address}".`
    )

    if (Address.isP2PKH(address)) {
      const asyncSigner = {
        sign(
          hash: Buffer,
          extraEntropy?: Buffer
        ): Promise<{ signature: Buffer; recovery: number }> {
          return signer.sign({
            signatureType: 'ecdsa',
            data: hash,
            extraEntropy,
            enc: 'sig,rec',
          })
        },
      }

      return bitcoinMessage.signAsync(message, asyncSigner, compressed)
    }

    const scriptPubKey = Address.convertAdressToScriptPubkey(address)
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey)
    let toSignTx: bitcoin.Psbt
    let tweak: Buffer | undefined

    if (Address.isP2SH(address)) {
      const redeemScript = bitcoin.payments.p2wpkh({
        hash: await hash('hash160', publicKey, 'buffer'),
        network,
      }).output as Buffer
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), redeemScript, true)
    } else if (Address.isP2WPKH(address)) {
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey)
    } else {
      // P2TR signing path
      const internalPublicKey = publicKey.subarray(1, 33)
      tweak = bitcoin.crypto.taggedHash('TapTweak', publicKey.subarray(1, 33))
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
    }

    const asyncSigner = createAsyncSigner({ signer, publicKey, tweak })

    await toSignTx.signAllInputsAsync(asyncSigner, [
      bitcoin.Transaction.SIGHASH_ALL,
      bitcoin.Transaction.SIGHASH_DEFAULT,
    ])

    return BIP322.encodeWitness(toSignTx.finalizeAllInputs())
  }

  /**
   * Check if a given public key is the public key for a claimed address.
   * @param publicKey Public key to be tested
   * @param claimedAddress Address claimed to be derived based on the provided public key
   * @returns True if the claimedAddress can be derived by the provided publicKey, false if otherwise
   */
  private static checkPubKeyCorrespondToAddress(publicKey: Buffer, claimedAddress: string) {
    // Derive the same address type from the provided public key
    let derivedAddresses: { mainnet?: string; testnet?: string }
    if (Address.isP2PKH(claimedAddress)) {
      derivedAddresses = Address.convertPubKeyIntoAddress(publicKey, 'p2pkh')
    } else if (Address.isP2SH(claimedAddress)) {
      derivedAddresses = Address.convertPubKeyIntoAddress(publicKey, 'p2sh-p2wpkh')
    } else if (Address.isP2WPKH(claimedAddress)) {
      derivedAddresses = Address.convertPubKeyIntoAddress(publicKey, 'p2wpkh')
    } else if (Address.isP2TR(claimedAddress)) {
      derivedAddresses = Address.convertPubKeyIntoAddress(publicKey, 'p2tr')!
    } else {
      throw new Error('Unable to sign BIP-322 message for unsupported address type.') // Unsupported address type
    }

    // Check if the derived address correspond to the claimedAddress
    return (
      derivedAddresses.mainnet === claimedAddress || derivedAddresses.testnet === claimedAddress
    )
  }
}

export default Signer
