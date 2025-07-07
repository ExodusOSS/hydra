import Address from './Address.js'
import BIP322 from './BIP322.js'
import type { SignerAsync } from '@exodus/bitcoinjs'
import * as bitcoin from '@exodus/bitcoinjs'
import * as bitcoinMessage from '@exodus/bitcoinjs/message'
import assert from 'minimalistic-assert'
import type { Signer as AssetSigner } from '@exodus/asset-types/src/signer'

type ToAsyncSignerParams = {
  publicKey: Buffer
  signatureType?: 'ecdsa' | 'schnorr'
  tweak?: Buffer
  signer: AssetSigner
}

const createAsyncSigner = ({ signer, publicKey, tweak }: ToAsyncSignerParams): SignerAsync => {
  return {
    publicKey,
    getPublicKey: () => publicKey,
    sign: async (data: Buffer) => signer.sign({ signatureType: 'ecdsa', data, enc: 'sig' }),
    signSchnorr: async (hash: Buffer) =>
      signer.sign({
        signatureType: 'schnorr',
        data: hash,
        tweak,
      }),
  }
}

/**
 * Class that signs BIP-322 signature using a private key.
 * Reference: https://github.com/LegReq/bip0322-signatures/blob/master/BIP0322_signing.ipynb
 */
class Signer {
  /**
   * Sign a BIP-322 signature from P2WPKH, P2SH-P2WPKH, and single-key-spend P2TR address and its corresponding private key.
   * @param privateKeyOrWIF
   * @param address Address to be signing the message
   * @param message message_challenge to be signed by the address
   * @param network Network that the address is located, defaults to the Bitcoin mainnet
   * @returns BIP-322 simple signature, encoded in base-64
   */
  public static sign(
    privateKeyOrWIF: string | Buffer,
    address: string,
    message: string,
    network: bitcoin.Network = bitcoin.networks.bitcoin
  ) {
    // Initialize private key used to sign the transaction

    // @ts-expect-error we know that ECPair exists
    const ECPair = bitcoin.ECPair
    let signer = Buffer.isBuffer(privateKeyOrWIF)
      ? ECPair.fromPrivateKey(privateKeyOrWIF)
      : ECPair.fromWIF(privateKeyOrWIF, network)
    // Check if the private key can sign message for the given address
    if (!this.checkPubKeyCorrespondToAddress(signer.publicKey, address)) {
      throw new Error(`Invalid private key provided for signing message for ${address}.`)
    }

    // Handle legacy P2PKH signature
    if (Address.isP2PKH(address)) {
      // For P2PKH address, sign a legacy signature
      // Reference: https://github.com/bitcoinjs/bitcoinjs-message/blob/c43430f4c03c292c719e7801e425d887cbdf7464/README.md?plain=1#L21
      return bitcoinMessage.signSync(message, signer.privateKey, signer.compressed)
    }

    // Convert address into corresponding script pubkey
    const scriptPubKey = Address.convertAdressToScriptPubkey(address)
    // Draft corresponding toSpend using the message and script pubkey
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey)
    // Draft corresponding toSign transaction based on the address type
    let toSignTx: bitcoin.Psbt
    if (Address.isP2SH(address)) {
      // P2SH-P2WPKH signing path
      // Derive the P2SH-P2WPKH redeemScript from the corresponding hashed public key
      const redeemScript = bitcoin.payments.p2wpkh({
        hash: bitcoin.crypto.hash160(signer.publicKey),
        network,
      }).output as Buffer
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), redeemScript, true)
    } else if (Address.isP2WPKH(address)) {
      // P2WPKH signing path
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey)
    } else {
      // P2TR signing path
      // Extract the taproot internal public key
      const internalPublicKey = signer.publicKey.subarray(1, 33)
      // Tweak the private key for signing, since the output and address uses tweaked key
      // Reference: https://github.com/bitcoinjs/bitcoinjs-lib/blob/1a9119b53bcea4b83a6aa8b948f0e6370209b1b4/test/integration/taproot.spec.ts#L55
      signer = signer.tweak(bitcoin.crypto.taggedHash('TapTweak', signer.publicKey.subarray(1, 33)))
      // Draft a toSign transaction that spends toSpend transaction
      toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
    }

    // Sign the toSign transaction
    const toSignTxSigned = toSignTx
      .signAllInputs(signer, [bitcoin.Transaction.SIGHASH_ALL, bitcoin.Transaction.SIGHASH_DEFAULT])
      .finalizeAllInputs()
    // Extract and return the signature
    return BIP322.encodeWitness(toSignTxSigned)
  }

  public static async signAsync(
    signer: string | Buffer | AssetSigner,
    address: string,
    message: string,
    network: bitcoin.Network = bitcoin.networks.bitcoin
  ) {
    if (typeof signer === 'string' || Buffer.isBuffer(signer)) {
      return this.sign(signer, address, message, network)
    }

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

      return bitcoinMessage.signAsync(message, asyncSigner, true)
    }

    const scriptPubKey = Address.convertAdressToScriptPubkey(address)
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey)
    let toSignTx: bitcoin.Psbt
    let tweak: Buffer | undefined

    if (Address.isP2SH(address)) {
      const redeemScript = bitcoin.payments.p2wpkh({
        hash: bitcoin.crypto.hash160(publicKey),
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
