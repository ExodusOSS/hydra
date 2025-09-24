import assert from 'minimalistic-assert'
import type { PsbtV2, DefaultDescriptorTemplate } from '@exodus/ledger-bitcoin'
import { DefaultWalletPolicy, WalletPolicy } from '@exodus/ledger-bitcoin'
import { payments, address as baddress, Transaction } from '@exodus/bitcoinjs'

import {
  buildBip44PathFromNumber,
  assertBip44PathNumber,
  splitBip44PathToNumber,
  splitBip44DerivationPath,
} from './derivation-paths'
import type { MultisigData } from 'libraries/hw-common/lib'

type Bip32Derivation = {
  readonly masterFingerprint: Buffer
  readonly path: readonly number[]
}

export function assertPsbtOnlyHasAllowedDerivationPaths(
  psbt: PsbtV2,
  masterFingerprint: string,
  derivationPaths: string[]
) {
  for (let i = 0; i < psbt.getGlobalInputCount(); i++) {
    const BIP32_DERIVATION = 6
    const TAP_BIP32_DERIVATION = 22
    const publicKeysNormal = psbt.getInputKeyDatas(i, BIP32_DERIVATION)
    const publicKeysTap = psbt.getInputKeyDatas(i, TAP_BIP32_DERIVATION)

    // First we validate that any BIP32 derivation params that were
    // pre-assigned by a third-party (potentially malicious)
    // is actually allowed by our "derivationPaths".
    for (const publicKey of publicKeysNormal) {
      const bip32Derivation = psbt.getInputBip32Derivation(i, publicKey)
      if (bip32Derivation) {
        assertAllowedDerivation(bip32Derivation, masterFingerprint, derivationPaths)
      }
    }

    // Repeat for TapBip32Derivation
    for (const publicKey of publicKeysTap) {
      const tapBip32Derivation = psbt.getInputTapBip32Derivation(i, publicKey)

      if (tapBip32Derivation) {
        assertAllowedDerivation(tapBip32Derivation, masterFingerprint, derivationPaths)
      }
    }
  }
}

function assertAllowedDerivation(
  bip32Derivation: Bip32Derivation,
  masterFingerprint: string,
  derivationPaths: string[]
) {
  const masterFingerprintToCheck = bip32Derivation.masterFingerprint.toString('hex')
  const isOurMasterFingerprint = masterFingerprintToCheck === masterFingerprint

  if (isOurMasterFingerprint) {
    // We're signing for this input, its derivation path must
    // be allow listed, throw otherwise.
    assertBip44PathNumber(bip32Derivation.path)
    const derivationPath = buildBip44PathFromNumber(bip32Derivation.path)
    assert(
      derivationPaths.includes(derivationPath),
      `found unsupported derivation path: ${derivationPath}`
    )
  }
}

/**
 * tagPsbtWithDerivationPaths will attach the necessary BIP32 derivation data
 * to each input & output by retrieving it "scriptPubKey" and checking if it matches
 * the "scriptPubKey" that we have computed from the public keys.
 * The Ledger hardware wallet will only sign inputs in the psbt that have the
 * BIP32 derivation data attached. When receiving PSBTs from third parties
 * we can reasonably assume that they won't have this data attached for us.
 * @param psbt
 * @param masterFingerprint
 * @param derivationPathToPublicKeyMap
 */
export function tagPsbtWithDerivationPaths(
  psbt: PsbtV2,
  masterFingerprint: string,
  derivationPathToPublicKeyMap: Record<string, Buffer>,
  addressToDerivationPathMap?: Record<string, string>
) {
  const masterFingerprintBuffer = Buffer.from(masterFingerprint, 'hex')

  const scriptPubKeyToDerivationPathMap = computeScriptPubKeyToDerivationPathMap(
    derivationPathToPublicKeyMap
  )

  const derivationPathsToSignFor: string[] = []
  for (let inputIndex = 0; inputIndex < psbt.getGlobalInputCount(); inputIndex++) {
    const witnessUtxo = psbt.getInputWitnessUtxo(inputIndex)
    const nonWitnessUtxo = psbt.getInputNonWitnessUtxo(inputIndex)

    let scriptPubKey: Buffer
    if (witnessUtxo) {
      scriptPubKey = witnessUtxo.scriptPubKey
    } else if (nonWitnessUtxo) {
      // Find the output index used by the input
      const prevOutputIndex = psbt.getInputOutputIndex(inputIndex)
      // Decode the transaction and extract the scriptPubKey
      const decodedTransaction = Transaction.fromBuffer(nonWitnessUtxo)
      scriptPubKey = decodedTransaction.outs[prevOutputIndex]!.script
    } else {
      throw new Error('missing witnessUtxo or nonWitnessUtxo')
    }

    // Can we find a derivation path for this input?
    let derivationPath = scriptPubKeyToDerivationPathMap[scriptPubKey.toString('hex')]
    if (addressToDerivationPathMap && !derivationPath) {
      // An input with a non-standard scriptPubKey will cause fromOutputScript to throw
      try {
        const address = baddress.fromOutputScript(scriptPubKey)
        derivationPath = addressToDerivationPathMap[address]
      } catch {}
    }

    if (derivationPath) {
      // It's our input, tag it with the BIP32 derivation information
      // so that it signs for the input.
      const publicKey = derivationPathToPublicKeyMap[derivationPath]
      assert(Buffer.isBuffer(publicKey), `no public key found for derivation path`)
      const derivationPathNumerical = splitBip44PathToNumber(derivationPath)

      if (isTaproot(scriptPubKey)) {
        psbt.setInputTapBip32Derivation(
          inputIndex,
          publicKey.slice(1), // X-only, cut parity byte
          [],
          masterFingerprintBuffer,
          derivationPathNumerical
        )
      } else {
        psbt.setInputBip32Derivation(
          inputIndex,
          publicKey,
          masterFingerprintBuffer,
          derivationPathNumerical
        )
      }

      derivationPathsToSignFor.push(derivationPath)
    }
  }

  for (let outputIndex = 0; outputIndex < psbt.getGlobalOutputCount(); outputIndex++) {
    const scriptPubKey = psbt.getOutputScript(outputIndex)

    // Can we find a derivation path for this output?
    let derivationPath = scriptPubKeyToDerivationPathMap[scriptPubKey.toString('hex')]
    if (addressToDerivationPathMap && !derivationPath) {
      // fromOutputScript will throw if the scriptPubKey is OP_RETURN, which we still want to send to
      try {
        const address = baddress.fromOutputScript(scriptPubKey)
        derivationPath = addressToDerivationPathMap[address]
      } catch {}
    }

    if (derivationPath) {
      // It's our output, tag it with the BIP32 derivation information
      // so that it doesn't get interpreted as an external address.
      const publicKey = derivationPathToPublicKeyMap[derivationPath]
      assert(Buffer.isBuffer(publicKey), `no public key found for derivation path`)
      const derivationPathNumerical = splitBip44PathToNumber(derivationPath)

      if (isTaproot(scriptPubKey)) {
        psbt.setOutputTapBip32Derivation(
          outputIndex,
          publicKey.slice(1), // X-only, cut parity byte
          [],
          masterFingerprintBuffer,
          derivationPathNumerical
        )
      } else {
        psbt.setOutputBip32Derivation(
          outputIndex,
          publicKey,
          masterFingerprintBuffer,
          derivationPathNumerical
        )
      }
    }
  }

  return derivationPathsToSignFor
}

function computeScriptPubKeyToDerivationPathMap(
  derivationPathToPublicKeyMap: Record<string, Buffer>
) {
  return Object.entries(derivationPathToPublicKeyMap).reduce((acc, [derivationPath, publicKey]) => {
    if (derivationPath.startsWith('m/44')) {
      // Compute p2pkh scriptPubKey from public key
      const p2pkh = payments.p2pkh({
        pubkey: publicKey,
      }).output

      assert(p2pkh, 'failed to compute p2pkh scriptPubKey')

      Object.assign(acc, {
        [p2pkh.toString('hex')]: derivationPath,
      })
    } else if (derivationPath.startsWith('m/49')) {
      // Compute nested segwit scriptPubKey from public key
      const nestedSegwit = payments.p2sh({
        redeem: payments.p2wpkh({ pubkey: publicKey }),
      }).output

      assert(nestedSegwit, 'failed to compute p2pkh scriptPubKey')

      Object.assign(acc, {
        [nestedSegwit.toString('hex')]: derivationPath,
      })
    } else if (derivationPath.startsWith('m/84')) {
      // Compute p2wpkh scriptPubKey from public key
      const p2wpkh = payments.p2wpkh({
        pubkey: publicKey,
      }).output

      assert(p2wpkh, 'failed to compute p2wpkh scriptPubKey')

      Object.assign(acc, {
        [p2wpkh.toString('hex')]: derivationPath,
      })
    } else if (derivationPath.startsWith('m/86')) {
      // Compute p2tr scriptPubKey from public key
      const p2tr = payments.p2tr({
        internalPubkey: publicKey.slice(1),
      }).output

      assert(p2tr, 'failed to compute p2tr scriptPubKey')

      Object.assign(acc, {
        [p2tr.toString('hex')]: derivationPath,
      })
    }

    return acc
  }, Object.create(null))
}

function isTaproot(scriptPubKey: Buffer) {
  return scriptPubKey.length === 34 && scriptPubKey.at(0) === 0x51 && scriptPubKey.at(1) === 0x20
}

export const getWalletPolicy = (
  fpr: string,
  xpub: string,
  purpose: string,
  coin: string,
  account: string
) => {
  const desc = <DefaultDescriptorTemplate>{
    "44'": 'pkh(@0/**)',
    "49'": 'sh(wpkh(@0/**))',
    "84'": 'wpkh(@0/**)',
    "86'": 'tr(@0/**)',
  }[purpose]
  return new DefaultWalletPolicy(desc, `[${fpr}/${purpose}/${coin}/${account}]${xpub}`)
}

export const getMultisigWalletPolicy = (
  fpr: string,
  xpub: string,
  purpose: string,
  coin: string,
  account: string,
  multisigData: MultisigData
): WalletPolicy => {
  let template = `tr(@0/**,sortedmulti_a(${multisigData.threshold}`
  const keys = [multisigData.internalXpub]
  multisigData.xpubs.forEach((xpub2, i) => {
    if (xpub === xpub2) {
      keys.push(`[${fpr}/${purpose}/${coin}/${account}]${xpub}`)
    } else {
      keys.push(xpub2)
    }

    template += `,@${i + 1}/**`
  })
  template += '))'
  return new WalletPolicy('Multisig', template, keys)
}

export async function derivationPathsToWalletPolicy(
  fpr: string,
  app: any,
  derivationPaths: string[],
  multisigData?: MultisigData
): Promise<WalletPolicy[]> {
  const splittedDerivationPaths = derivationPaths.map(splitBip44DerivationPath)

  const dedupedPaths: any[] = Object.values(
    splittedDerivationPaths.reduce((prev, splittedDerivationPath) => {
      const [purpose, coin, account] = splittedDerivationPath
      prev[[purpose, coin, account].toString()] = [purpose, coin, account]
      return prev
    }, Object.create(null))
  )

  const walletPolicies: WalletPolicy[] = []
  for (const dedupedPath of dedupedPaths) {
    const [purpose, coin, account] = dedupedPath
    const xpub = await app.getExtendedPubkey(`m/${purpose}/${coin}/${account}`)
    if (multisigData) {
      walletPolicies.push(getMultisigWalletPolicy(fpr, xpub, purpose, coin, account, multisigData))
    } else {
      walletPolicies.push(getWalletPolicy(fpr, xpub, purpose, coin, account))
    }
  }

  return walletPolicies
}

/**
 * Checks whether all the inputs of the PSBT only require that its signature hash only
 * covers the input itself. Essentially allowing us to add inputs without modifying the
 * signature hashes of other inputs.
 * @param psbt
 * @returns
 */
function canModifyInputs(psbt: PsbtV2) {
  const SIGHASH_ALL = 0x01
  const SIGHASH_NONE = 0x02
  const SIGHASH_SINGLE = 0x03

  for (let i = 0; i < psbt.getGlobalInputCount(); i++) {
    // Undefined defaults to SIGHASH_ALL
    if (
      [SIGHASH_ALL, SIGHASH_NONE, SIGHASH_SINGLE, undefined].includes(psbt.getInputSighashType(i))
    ) {
      return false
    }
  }

  return true
}

/**
 * Pad the transaction with an external dummy input to satisify a condition
 * in the Ledger firmware that requires the sum of outputs to be larger or equal
 * to the sum of inputs.
 * @param psbt
 */
export function addDummyInputs(psbt: PsbtV2) {
  const canAddDummy = canModifyInputs(psbt)
  if (!canAddDummy) {
    return
  }

  let outputAmount = 0
  for (let i = 0; i < psbt.getGlobalOutputCount(); i++) {
    outputAmount += psbt.getOutputAmount(i)
  }

  let inputAmount = 0
  for (let i = 0; i < psbt.getGlobalInputCount(); i++) {
    const witnessUtxo = psbt.getInputWitnessUtxo(i)
    if (witnessUtxo) {
      inputAmount += witnessUtxo.amount
    }
  }

  if (outputAmount > inputAmount) {
    // Add a dummy input to prevent the ledger from
    // throwing an error w.r.t a negative fee.
    const newInputIndex = psbt.getGlobalInputCount()
    const amount = outputAmount - inputAmount
    psbt.setGlobalInputCount(newInputIndex + 1)
    // A little easter egg, we use the very first transaction in the bitcoin
    // blockchain as the dummy input, this should make it abundantly clear
    // to external observers that this is likely not really an input.
    const FIRST_BITCOIN_TXID = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b'
    psbt.setInputPreviousTxId(newInputIndex, Buffer.from(FIRST_BITCOIN_TXID, 'hex'))
    psbt.setInputOutputIndex(newInputIndex, 0)
    psbt.setInputWitnessUtxo(newInputIndex, amount, Buffer.from('01', 'hex'))
  }
}
