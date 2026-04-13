import type { ExodusTrezorEvents } from './exodus-trezor-events'
import { createMeta } from '@exodus/trezor-meta'
import { fromBase58 } from '@exodus/bytes/base58.js'
import { md5 } from '@noble/hashes/legacy.js'
import assert from 'minimalistic-assert'

import type {
  Bytes,
  EnsureDeviceReadyParams,
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletDescriptor,
  HardwareWalletDevice,
  Message,
  Signatures,
  SignMessageParams,
  SignTransactionParams,
} from '@exodus/hw-common'
import {
  XPubUnsupportedError,
  UserRefusedError,
  WrongWalletSelectedError,
  PassphraseProtectionEnableFailedError,
} from '@exodus/hw-common'

interface EIP712Message {
  types: Record<string, { name: string; type: string }[]>
  primaryType: string
  domain: Record<string, unknown>
  message: Record<string, unknown>
  [key: string]: unknown
}

function isEIP712Message(message: Record<string, unknown>): message is EIP712Message {
  const ownKeys = ['types', 'primaryType', 'domain', 'message']
  const candidateKeys = Object.keys(message)

  return (
    candidateKeys.length === ownKeys.length && candidateKeys.every((key) => ownKeys.includes(key))
  )
}

const TREZOR_ACTION_CANCELLED_CODE = 'Failure_ActionCancelled'
const TREZOR_WALLET_ID_PATH = `44'/0'/0'`

export class TrezorDevice implements HardwareWalletDevice {
  #events: ExodusTrezorEvents
  #descriptor: HardwareWalletDescriptor
  #assetNames: string[]

  constructor(events: ExodusTrezorEvents, descriptor: HardwareWalletDescriptor, assetsModule: any) {
    this.#events = events
    this.#descriptor = descriptor

    const assets = assetsModule.getAssets()
    const trezorMeta = createMeta(assets)
    const model = descriptor.model

    this.#assetNames = trezorMeta.ASSETS_BY_MODEL[model]!.filter((assetName) => {
      const asset = assets[assetName]
      return asset.baseAsset.name === assetName
    })
  }

  listSupportedAssetNames: () => Promise<string[]> = async () => this.#assetNames
  listInstalledAssetNames: () => Promise<string[]> = async () => this.#assetNames
  listUseableAssetNames: () => Promise<string[]> = async () => this.#assetNames

  cancelAction: () => Promise<void> = async () => {
    await this.#events.cancelCurrentAction()
  }

  setPassphraseMode = async (mode: 'standard' | 'hidden'): Promise<void> => {
    const prevMode = this.#events.getPassphraseMode()
    if (prevMode !== mode) {
      if (mode === 'hidden') {
        const features = await this.#events.features()
        if (!features.passphrase_protection) {
          await this.#events.applySettings({ use_passphrase: true })
          const features2 = await this.#events.features()
          if (!features2.passphrase_protection) {
            throw new PassphraseProtectionEnableFailedError()
          }
        }
      }

      this.#events.setPassphraseMode(mode)
      await this.#events.initialize()
    }
  }

  getWalletId = async (): Promise<string> => {
    const xpub = await this.#events.getXPub(TREZOR_WALLET_ID_PATH)
    const decoded = fromBase58(xpub, 'buffer') as Buffer
    // Match desktop exactly: md5(bs58.decode(xpub)) -> hex
    return Buffer.from(md5(decoded)).toString('hex')
  }

  ensureDeviceReady = async ({ walletAccount }: EnsureDeviceReadyParams): Promise<void> => {
    const walletId = String(walletAccount.id ?? '')

    // Legacy accounts may have id === <deviceId> (no walletId persisted).
    // In that case, treat as standard and avoid triggering a passphrase prompt.
    if (!/^[\da-f]{32}$/iu.test(walletId)) {
      if (this.#events.getPassphraseMode() !== 'standard') {
        await this.setPassphraseMode('standard')
      }

      return
    }

    // Attempt 1: check current session first (avoids resets/prompts when already correct).
    const walletIdCurrent = await this.getWalletId()
    if (walletIdCurrent === walletId) return

    // Attempt 2: reset to standard wallet context (no passphrase prompt) and re-check.
    await this.setPassphraseMode('standard')
    const walletIdStandard = await this.getWalletId()
    if (walletIdStandard === walletId) return

    // Attempt 3: reset to hidden wallet context and prompt for passphrase on-device, then re-check.
    await this.setPassphraseMode('hidden')
    const walletIdHidden = await this.getWalletId()
    if (walletIdHidden === walletId) return

    throw new WrongWalletSelectedError()
  }

  getAddress: (params: GetAddressParams) => Promise<string> = async (params) => {
    try {
      const { address } = await this.#events.getAddress(params.assetName, params.derivationPath, {
        multisigData: params.multisigData,
        display: params.displayOnDevice,
        segwit: ['bitcoin', 'bitcoinregtest'].includes(params.assetName),
      })
      return address
    } catch (error: any) {
      if (error.code === TREZOR_ACTION_CANCELLED_CODE) {
        throw new UserRefusedError(true)
      }

      throw error
    }
  }

  getXPub: (params: GetXPubParams) => Promise<string> = async ({ assetName, derivationPath }) => {
    // eslint-disable-next-line @exodus/hydra/no-asset-conditions
    if (['solana', 'ethereum'].includes(assetName)) {
      throw new XPubUnsupportedError()
    }

    return this.#events.getXPub(derivationPath)
  }

  getPublicKey: (params: GetPublicKeyParams) => Promise<Bytes> = async ({
    assetName,
    derivationPath,
  }) => {
    return this.#events.getPublicKey(derivationPath, assetName)
  }

  signTransaction: (params: SignTransactionParams) => Promise<Signatures> = async ({
    assetName,
    derivationPathsMap,
    derivationPaths,
    signableTransaction,
    tokenAccountsInfos,
  }) => {
    try {
      const derivationPath = derivationPathsMap ?? derivationPaths[0]
      const { signature, publicKey, signatures } = await this.#events.signTransaction(
        assetName,
        signableTransaction,
        derivationPath,
        { eip1559Enabled: true, tokenAccountsInfos }
      )

      return signatures ?? [{ signature, publicKey }]
    } catch (error: any) {
      if (error.code === TREZOR_ACTION_CANCELLED_CODE) {
        throw new UserRefusedError(true)
      }

      throw error
    }
  }

  signMessage: (params: SignMessageParams<Message>) => Promise<Bytes> = async (params) => {
    try {
      const message = params.message as Message & {
        EIP712Message?: EIP712Message
      }

      const derivationPath = params.derivationPath.replace('m/', '')

      if (message.rawMessage) {
        assert(Buffer.isBuffer(message.rawMessage), 'rawMessage must be a buffer')
        const { signature } = await this.#events.signEthereumMessage(
          derivationPath,
          message.rawMessage
        )
        return signature
      }

      if (message.EIP712Message) {
        assert(isEIP712Message(message.EIP712Message), 'EIP712Message must be EIP712 conformant')
        const { signature } = await this.#events.signEthereumTypedData(
          derivationPath,
          message.EIP712Message
        )
        return signature
      }

      assert(false, 'rawMessage or EIP712Message must be specified')
    } catch (error: any) {
      if (error.code === TREZOR_ACTION_CANCELLED_CODE) {
        throw new UserRefusedError(true)
      }

      throw error
    }
  }

  get descriptor() {
    return this.#descriptor
  }
}
