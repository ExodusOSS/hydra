import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'

import type {
  AddressProvider,
  AssetsModule,
  InternalSigner,
  InternalSignMessageParams,
} from './interfaces.js'

import type { Keychain } from '@exodus/keychain/module'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'seedBasedMessageSigner'

type Dependencies = {
  assetsModule: AssetsModule
  keychain: Keychain
  addressProvider: AddressProvider
}

class SeedBasedMessageSigner implements InternalSigner {
  readonly #assetsModule
  readonly #keychain
  readonly #addressProvider

  constructor({ assetsModule, keychain, addressProvider }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#keychain = keychain
    this.#addressProvider = addressProvider
  }

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
    const defaultPurpose: number = purposes[0]!

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
      compatibilityMode: walletAccount.compatibilityMode,
    })

    return new KeyIdentifier(keyId)
  }

  signMessage = async (opts: InternalSignMessageParams) => {
    const { baseAssetName, message, walletAccount } = opts
    const baseAsset = this.#assetsModule.getAsset(baseAssetName)

    assert(baseAsset, `baseAsset not found`)
    assert(baseAsset.api.signMessage, `message signing not supported by asset ${baseAssetName}`)

    const keyId = await this.#getKeyId(opts)

    const { privateKey } = await this.#keychain.exportKey({
      seedId: walletAccount.seedId,
      keyId,
      exportPrivate: true,
    })

    return baseAsset.api.signMessage({
      privateKey,
      message,
    })
  }
}

const createSeedBasedMessageSigner = (opts: Dependencies) => new SeedBasedMessageSigner(opts)

const seedBasedMessageSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createSeedBasedMessageSigner,
  dependencies: ['assetsModule', 'keychain', 'addressProvider'],
} as const satisfies Definition

export default seedBasedMessageSignerDefinition
