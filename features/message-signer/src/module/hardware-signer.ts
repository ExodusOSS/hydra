import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'

import type {
  AssetSources,
  Asset,
  InternalSigner,
  HardwareSignerProvider,
  InternalSignMessageParams,
} from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'

const MODULE_ID = 'hardwareMessageSigner'

type Dependencies = {
  assetsAtom: Atom<{ value: Record<string, Asset> }>
  hardwareWallets?: HardwareSignerProvider
  assetSources: AssetSources
}

class HardwareMessageSigner implements InternalSigner {
  readonly #assetsAtom
  readonly #hardwareWallets
  readonly #assetSources

  constructor({ assetsAtom, hardwareWallets, assetSources }: Dependencies) {
    this.#assetsAtom = assetsAtom
    this.#hardwareWallets = hardwareWallets
    this.#assetSources = assetSources
  }

  // where does this belong? We'll need to reuse it for the message signer
  #getKeyId = async (opts: InternalSignMessageParams) => {
    const { baseAssetName, message, walletAccount, purpose } = opts

    assert(typeof baseAssetName === 'string', 'baseAssetName is required')
    assert(walletAccount && typeof walletAccount === 'object', 'walletAccount is required')
    assert(message && typeof message === 'object', 'message is required')

    const { value: assets } = await this.#assetsAtom.get()
    const baseAsset = assets[opts.baseAssetName]!
    const compatibilityMode = walletAccount.compatibilityMode

    const purposes = await this.#assetSources.getSupportedPurposes({
      assetName: baseAssetName,
      walletAccount: walletAccount.toString(),
    })
    assert(typeof purposes[0] === 'number', `no purposes returned by getSupportedPurposes`)
    const defaultPurpose: number = purposes[0]

    const defaultPathIndexes = getDefaultPathIndexes({
      asset: baseAsset,
      walletAccount,
      compatibilityMode,
    })

    const { chainIndex, addressIndex } = defaultPathIndexes

    const keyId = baseAsset.api.getKeyIdentifier({
      purpose: purpose ?? defaultPurpose,
      accountIndex: walletAccount.index!,
      addressIndex,
      chainIndex,
      compatibilityMode,
    })

    return new KeyIdentifier(keyId)
  }

  signMessage = async (opts: InternalSignMessageParams) => {
    assert(this.#hardwareWallets, `hardwareWallets module not found`)
    const { baseAssetName, message, walletAccount } = opts
    const { value: assets } = await this.#assetsAtom.get()
    const baseAsset = assets[baseAssetName]

    assert(baseAsset, `baseAsset not found`)
    assert(baseAsset.api.signMessage, `message signing not supported by asset ${baseAssetName}`)

    const keyId = await this.#getKeyId(opts)

    const device = await this.#hardwareWallets.requireDeviceFor(walletAccount)

    return device.signMessage({
      assetName: baseAssetName,
      derivationPath: keyId.derivationPath,
      message,
    })
  }
}

const createHardwareMessageSigner = (opts: Dependencies) => new HardwareMessageSigner(opts)

const hardwareMessageSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createHardwareMessageSigner,
  dependencies: ['assetsAtom', 'assetSources', 'hardwareWallets?'],
} as const satisfies Definition

export type { HardwareMessageSigner }

export default hardwareMessageSignerDefinition
