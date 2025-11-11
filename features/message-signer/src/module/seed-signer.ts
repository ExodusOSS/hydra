import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'
import type {
  KeychainSignerParams,
  AssetSources,
  AssetsModule,
  InternalSigner,
  InternalSignMessageParams,
} from './interfaces.js'

import type { WalletAccount } from '@exodus/models'
import type { Keychain } from '@exodus/keychain/module'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'seedBasedMessageSigner'

type Dependencies = {
  assetsModule: AssetsModule
  keychain: Keychain
  assetSources: AssetSources
}

class SeedBasedMessageSigner implements InternalSigner {
  readonly #assetsModule
  readonly #keychain
  readonly #assetSources

  constructor({ assetsModule, keychain, assetSources }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#keychain = keychain
    this.#assetSources = assetSources
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

    const purposes = await this.#assetSources.getSupportedPurposes({
      assetName: baseAssetName,
      walletAccount: walletAccount.toString(),
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

  #getSigner = ({ keyId, seedId }: { keyId: KeyIdentifier; seedId: WalletAccount['seedId'] }) => {
    return {
      getPublicKey: async () => this.#keychain.getPublicKey({ seedId, keyId }),

      sign: async ({
        data,
        signatureType,
        enc,
        tweak,
        extraEntropy,
      }: KeychainSignerParams): Promise<Buffer> =>
        this.#keychain.signBuffer({
          seedId,
          keyId,
          data,
          signatureType,
          enc,
          tweak,
          extraEntropy,
        }),
    }
  }

  signMessage = async (opts: InternalSignMessageParams) => {
    const { baseAssetName, message, walletAccount } = opts
    const baseAsset = this.#assetsModule.getAsset(baseAssetName)

    assert(baseAsset, `baseAsset not found`)
    assert(
      baseAsset.api.features.signMessageWithSigner,
      `asset ${baseAssetName} does not support message signing`
    )

    const keyId = await this.#getKeyId(opts)

    return baseAsset.api.signMessage!({
      signer: this.#getSigner({ keyId, seedId: walletAccount.seedId }),
      message,
    })
  }
}

const createSeedBasedMessageSigner = (opts: Dependencies) => new SeedBasedMessageSigner(opts)

const seedBasedMessageSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createSeedBasedMessageSigner,
  dependencies: ['assetsModule', 'keychain', 'assetSources'],
} as const satisfies Definition

export default seedBasedMessageSignerDefinition
