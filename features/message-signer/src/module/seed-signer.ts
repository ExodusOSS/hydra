import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'
import type {
  KeychainSignerParams,
  AssetSources,
  Asset,
  InternalSigner,
  InternalSignMessageParams,
} from './interfaces.js'

import type { WalletAccount } from '@exodus/models'
import type { Keychain } from '@exodus/keychain'
import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'

const MODULE_ID = 'seedBasedMessageSigner'

type Dependencies = {
  assetsAtom: Atom<{ value: Record<string, Asset> }>
  keychain: Keychain
  assetSources: AssetSources
}

class SeedBasedMessageSigner implements InternalSigner {
  readonly #assetsAtom
  readonly #keychain
  readonly #assetSources

  constructor({ assetsAtom, keychain, assetSources }: Dependencies) {
    this.#assetsAtom = assetsAtom
    this.#keychain = keychain
    this.#assetSources = assetSources
  }

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
      compatibilityMode,
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
        }) as Promise<Buffer>,
    }
  }

  signMessage = async (opts: InternalSignMessageParams) => {
    const { baseAssetName, message, walletAccount } = opts
    const { value: assets } = await this.#assetsAtom.get()
    const baseAsset = assets[baseAssetName]

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
  dependencies: ['assetsAtom', 'keychain', 'assetSources'],
} as const satisfies Definition

export type { SeedBasedMessageSigner }

export default seedBasedMessageSignerDefinition
