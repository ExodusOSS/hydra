import bs58 from 'bs58'
import type { WalletPolicy } from '@exodus/ledger-bitcoin'
import { AppClient, PsbtV2 } from '@exodus/ledger-bitcoin'
import { BIP322 } from '@exodus/bip322-js'

import type Transport from '@ledgerhq/hw-transport'
import type { Atom } from '@exodus/atoms'

import type {
  Bytes,
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletAssetHandler,
  SignMessageParams,
  SignTransactionParams,
  Signatures,
} from '@exodus/hw-common'
import { splitBip44DerivationPath } from './utils'
import assert from 'minimalistic-assert'
import {
  assertPsbtOnlyHasAllowedDerivationPaths,
  tagPsbtWithDerivationPaths,
  getWalletPolicy,
  getMultisigWalletPolicy,
  derivationPathsToWalletPolicy,
  addDummyInputs,
} from './utils/psbt'
import { buildBip322PSBT } from './utils/bip322'
import applications from './applications'

export interface BitcoinMessage {
  rawMessage?: Bytes

  bip322Message?: {
    address: string
    message: Bytes
  }

  bip137Message?: {
    address: string
    message: Bytes
  }
}

async function createHandler(
  transport: Transport,
  walletPolicyAtom?: Atom<Record<string, Buffer>>
): Promise<HardwareWalletAssetHandler<BitcoinMessage>> {
  const app = new AppClient(transport)
  const getAddress = async (params: GetAddressParams) => {
    const [purpose, coin, account, change, address] = splitBip44DerivationPath(
      params.derivationPath
    )
    const fpr = await app.getMasterFingerprint()
    const xpub = await app.getExtendedPubkey(`m/${purpose}/${coin}/${account}`)
    let walletPolicy
    let hmac = null
    if (params.multisigData) {
      walletPolicy = getMultisigWalletPolicy(fpr, xpub, purpose, coin, account, params.multisigData)
      hmac = await registerWalletPolicy(walletPolicy)
    } else {
      walletPolicy = getWalletPolicy(fpr, xpub, purpose, coin, account)
    }

    return app.getWalletAddress(
      walletPolicy,
      hmac,
      Number(change),
      Number(address),
      params.displayOnDevice ?? false // show address on the wallet's screen
    )
  }

  const getXPub = async (params: GetXPubParams) => {
    return app.getExtendedPubkey(params.derivationPath)
  }

  const getPublicKey = async (params: GetPublicKeyParams) => {
    return bs58.decode(await app.getExtendedPubkey(params.derivationPath)).slice(45, 45 + 33)
  }

  const signTransaction = async (params: SignTransactionParams) => {
    assert(Buffer.isBuffer(params.signableTransaction), 'signableTransaction must be PSBT buffer')

    const psbtBuffer = params.signableTransaction
    const psbt = new PsbtV2()
    psbt.deserialize(psbtBuffer)

    const fpr = await app.getMasterFingerprint()

    // Tag all of our own inputs and outputs with their corresponding
    // derivation information so the ledger knows which ones are ours.
    const derivationPathToPublicKeyMap = Object.create(null)
    const addressToDerivationPathMap = Object.create(null)
    for (const derivationPath of params.derivationPaths) {
      if (params.multisigData) {
        const address = await getAddress({
          assetName: 'bitcoin',
          derivationPath,
          multisigData: params.multisigData,
        })
        addressToDerivationPathMap[address] = derivationPath
      }

      const publicKey = await getPublicKey({
        assetName: 'bitcoin',
        derivationPath,
      })
      derivationPathToPublicKeyMap[derivationPath] = publicKey
    }

    tagPsbtWithDerivationPaths(psbt, fpr, derivationPathToPublicKeyMap, addressToDerivationPathMap)

    addDummyInputs(psbt)

    // Sanity check that the PSBT doesn't try to sign any
    // derivation paths that were not allowed listed.
    assertPsbtOnlyHasAllowedDerivationPaths(psbt, fpr, params.derivationPaths)

    const signatures: any[] = []
    const walletPolicies = await derivationPathsToWalletPolicy(
      fpr,
      app,
      params.derivationPaths,
      params.multisigData
    )

    for (const walletPolicy of walletPolicies) {
      const hmac = params.multisigData ? await registerWalletPolicy(walletPolicy) : null
      const _signatures = await app.signPsbt(psbt.serialize(), walletPolicy, hmac)
      signatures.push(..._signatures)
    }

    const result: Signatures = signatures.map(([inputIndex, partialSignature]) => ({
      inputIndex,
      publicKey: partialSignature.pubkey,
      signature: partialSignature.signature,
      tapleafHash: partialSignature.tapleafHash,
    }))

    return result
  }

  const signMessage = async (params: SignMessageParams<BitcoinMessage>) => {
    if (params.message.rawMessage) {
      assert(Buffer.isBuffer(params.message.rawMessage), 'rawMessage must be buffer')
      const signedMessageHex = await app.signMessage(
        params.message.rawMessage,
        params.derivationPath
      )
      return Buffer.from(signedMessageHex, 'base64')
    }

    if (params.message.bip322Message) {
      const { message, address } = params.message.bip322Message
      const { derivationPath } = params

      assert(Buffer.isBuffer(message), 'bip322Message.message must be buffer')
      assert(typeof address === 'string', 'bip322Message.address must be string')

      const [purpose, coin, account] = splitBip44DerivationPath(derivationPath)
      const fpr = await app.getMasterFingerprint()
      const xpub = await app.getExtendedPubkey(`m/${purpose}/${coin}/${account}`)
      const walletPolicy = getWalletPolicy(fpr, xpub, purpose, coin, account)

      const psbtBip322 = buildBip322PSBT(message.toString(), address)

      const psbt = new PsbtV2()
      psbt.deserialize(psbtBip322.toBuffer())

      // Tag our own inputs and outputs with their corresponding
      // derivation information so the ledger knows which ones are ours.
      const derivationPathToPublicKeyMap = {
        [derivationPath]: await getPublicKey({
          assetName: 'bitcoin',
          derivationPath,
        }),
      }
      tagPsbtWithDerivationPaths(psbt, fpr, derivationPathToPublicKeyMap)

      const signatures = await app.signPsbt(psbt.serialize(), walletPolicy, null)
      const signature = signatures[0]![1]

      const isTaprootSig = signature.pubkey.length === 32
      if (isTaprootSig) {
        psbtBip322.updateInput(0, {
          tapKeySig: signature.signature,
        })
      } else {
        psbtBip322.updateInput(0, {
          partialSig: [signature],
        })
      }

      psbtBip322.finalizeAllInputs()

      const encodedWitness = BIP322.encodeWitness(psbtBip322 as any)
      return Buffer.from(encodedWitness, 'base64')
    }

    throw new Error('rawMessage or bip322Message must be defined')
  }

  const registerWalletPolicy = async (walletPolicy: WalletPolicy): Promise<Buffer> => {
    const walletPolicies = (await walletPolicyAtom?.get()) ?? {}
    const id = walletPolicy.getId().toString('hex')
    let hmac = walletPolicies[id]
    if (!hmac) {
      const [, h] = await app.registerWallet(walletPolicy)
      hmac = h
      const updatedPolicies = { ...walletPolicies, [id]: hmac }
      await walletPolicyAtom?.set(updatedPolicies)
    }

    return hmac
  }

  return {
    getAddress,
    getPublicKey,
    getXPub,
    signTransaction,
    signMessage,
  }
}

const metadata = {
  applications: [applications.Bitcoin],
  handler: createHandler,
}

export default metadata
