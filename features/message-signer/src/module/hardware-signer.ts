import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'

import type {
  AddressProvider,
  AssetsModule,
  InternalSigner,
  HardwareSignerProvider,
  InternalSignMessageParams,
} from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'hardwareMessageSigner'

type Dependencies = {
  assetsModule: AssetsModule
  hardwareWallets?: HardwareSignerProvider
  addressProvider: AddressProvider
}

class HardwareMessageSigner implements InternalSigner {
  readonly #assetsModule
  readonly #hardwareWallets
  readonly #addressProvider

  constructor({ assetsModule, hardwareWallets, addressProvider }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#hardwareWallets = hardwareWallets
    this.#addressProvider = addressProvider
  }

  // where does this belong? We'll need to reuse it for the message signer
  #getKeyId = async (opts: InternalSignMessageParams) => {
    const { baseAssetName, message, walletAccount, purpose } = opts

    assert(typeof baseAssetName === 'string', 'baseAssetName is required')
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    assert(walletAccount && typeof walletAccount === 'object', 'walletAccount is required')
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    assert(message && typeof message === 'object', 'message is required')

    const baseAsset = this.#assetsModule.getAsset(opts.baseAssetName)
    const compatibilityMode = walletAccount.compatibilityMode

    const purposes = await this.#addressProvider.getSupportedPurposes({
      assetName: baseAssetName,
      walletAccount,
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
    const baseAsset = this.#assetsModule.getAsset(baseAssetName)

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
  dependencies: ['assetsModule', 'addressProvider', 'hardwareWallets?'],
} as const satisfies Definition

export default hardwareMessageSignerDefinition
