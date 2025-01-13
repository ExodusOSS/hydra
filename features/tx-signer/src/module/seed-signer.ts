import { getDefaultPathIndexes } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'
import type {
  Asset,
  AssetsModule,
  GetPublicKeyParams,
  InternalSigner,
  InternalSignTransactionParams,
  KeychainSignerParams,
  Signer,
} from './interfaces.js'

import type { AssetSources } from '@exodus/asset-sources/lib/module/asset-sources.js'
import type { Definition } from '@exodus/dependency-types'
import type { WalletAccount } from '@exodus/models'

const MODULE_ID = 'seedBasedTransactionSigner'

type Dependencies = {
  assetsModule: AssetsModule
  assetSources: AssetSources
  keychain: any
  walletSdk?: any
}

class SeedBasedTransactionSigner implements InternalSigner {
  readonly #assetsModule
  readonly #assetSources
  readonly #keychain
  readonly #rpcSigning

  constructor({ assetsModule, assetSources, keychain, walletSdk }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#assetSources = assetSources
    this.#keychain = keychain
    this.#rpcSigning = Boolean(walletSdk)
  }

  // where does this belong? We'll need to reuse it for the message signer
  #getKeyIds = async (opts: InternalSignTransactionParams) => {
    const { baseAssetName, unsignedTx, walletAccount } = opts

    assert(typeof baseAssetName === 'string', 'baseAssetName is required')
    assert(typeof walletAccount === 'object', 'walletAccount is required')
    assert(typeof unsignedTx === 'object', 'unsignedTx is required')

    const baseAsset = this.#assetsModule.getAsset(opts.baseAssetName)
    const compatibilityMode = walletAccount.compatibilityMode
    const purposes = await this.#assetSources.getSupportedPurposes({
      assetName: baseAsset.name,
      walletAccount: walletAccount.toString(),
    })

    // When an asset is useMultipleAddresses: true (e.g. bitcoin), the root hd keys are provided to the sign method.
    // The asset's signTx is in charge of deriving the right sub-hdkey based on the required chain and address indexes.
    const defaultPathIndexes: { chainIndex?: number; addressIndex?: number } =
      baseAsset.useMultipleAddresses
        ? {}
        : getDefaultPathIndexes({ asset: baseAsset, compatibilityMode })

    const { chainIndex, addressIndex } = defaultPathIndexes
    return purposes.map((purpose) => {
      return new KeyIdentifier(
        baseAsset.api.getKeyIdentifier({
          purpose,
          accountIndex: walletAccount.index!,
          addressIndex,
          chainIndex,
          compatibilityMode: walletAccount.compatibilityMode,
        })
      )
    })
  }

  async #getSigner({
    baseAsset, // maybe we'll need this for default purpose
    walletAccount,
  }: {
    baseAsset: Asset
    walletAccount: WalletAccount
  }): Promise<Signer> {
    const { seedId } = walletAccount
    const defaultPurpose = await this.#assetSources.getDefaultPurpose({
      walletAccount: walletAccount.toString(),
      assetName: baseAsset.name,
    })
    const { chainIndex, addressIndex } = getDefaultPathIndexes({
      asset: baseAsset,
      walletAccount,
      compatibilityMode: walletAccount.compatibilityMode,
    })

    const getDefaultKeyIdentifier = () => {
      return new KeyIdentifier(
        baseAsset.api.getKeyIdentifier({
          compatibilityMode: walletAccount.compatibilityMode,
          purpose: defaultPurpose,
          accountIndex: walletAccount.index!,
          chainIndex,
          addressIndex,
        })
      )
    }

    const getPublicKey = async ({
      keyId = getDefaultKeyIdentifier(),
    }: GetPublicKeyParams = {}): Promise<Buffer> => {
      const { publicKey } = await this.#keychain.exportKey({ seedId, keyId })
      return publicKey
    }

    const sign = ({
      data,
      keyId = getDefaultKeyIdentifier(),
      signatureType,
      enc,
      tweak,
      extraEntropy,
    }: KeychainSignerParams): Promise<any> => {
      const noTweak = tweak === undefined
      const noEnc = enc === undefined
      const noOpts = noEnc && noTweak && extraEntropy === undefined

      assert(data instanceof Uint8Array, `expected "data" to be a Uint8Array, got: ${typeof data}`)
      assert(
        !signatureType ||
          (['ecdsa', 'schnorr', 'schnorrZ'].includes(signatureType) &&
            keyId.keyType === 'secp256k1') ||
          (signatureType === 'ed25519' && keyId.keyType === 'nacl'),
        `"keyId.keyType" ${keyId.keyType} does not support "signatureType" ${signatureType}`
      )

      if (keyId.keyType === 'nacl') {
        assert(noOpts, 'unsupported options supplied for ed25519 signature')
        return this.#keychain.ed25519.signBuffer({ seedId, keyId, data })
      }

      if (signatureType === 'schnorrZ') {
        assert(noOpts, 'unsupported options supplied for schnorrZ signature')
        return this.#keychain.secp256k1.signSchnorrZ({ seedId, keyId, data })
      }

      // only accept 32 byte buffers for ecdsa
      assert(data.length === 32, `expected "data" to have 32 bytes, got: ${data.length}`)

      if (signatureType === 'schnorr') {
        assert(noEnc, 'unsupported options supplied for schnorr signature')
        return this.#keychain.secp256k1.signSchnorr({ seedId, keyId, data, tweak, extraEntropy })
      }

      assert(noTweak, 'unsupported options supplied for ecdsa signature')
      return this.#keychain.secp256k1.signBuffer({ seedId, keyId, data, enc, extraEntropy })
    }

    return { sign, getPublicKey }
  }

  signTransaction = async (opts: InternalSignTransactionParams) => {
    const { baseAssetName, unsignedTx, walletAccount } = opts
    const baseAsset = this.#assetsModule.getAsset(baseAssetName)

    if (!('compatibilityMode' in unsignedTx.txMeta)) {
      unsignedTx.txMeta.compatibilityMode = walletAccount.compatibilityMode
    }

    if (!('accountIndex' in unsignedTx.txMeta)) {
      unsignedTx.txMeta.accountIndex = walletAccount.index
    }

    assert(
      Number.isInteger(unsignedTx.txMeta?.accountIndex),
      `txMeta.accountIndex was not a valid integer`
    )

    if (baseAsset.api.features.signWithSigner) {
      const signer = await this.#getSigner({ baseAsset, walletAccount })
      const signTx = baseAsset.api.signTx!
      return signTx({ unsignedTx, signer })
    }

    const options = this.#rpcSigning
      ? { baseAssetName }
      : {
          // new baseAsset.api.signTx with object parameter: signTx({ unsignedTx, privateKey, hdkeys }).
          signTxCallback: baseAsset.api.signTx,
        }

    // @deprecated use signTransaction() instead
    return this.#keychain.signTx({
      ...options,
      seedId: walletAccount.seedId,
      keyIds: await this.#getKeyIds(opts),
      unsignedTx,
    })
  }
}

const createSeedBasedTransactionSigner = (opts: Dependencies) =>
  new SeedBasedTransactionSigner(opts)

const seedBasedTransactionSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createSeedBasedTransactionSigner,
  dependencies: ['assetsModule', 'assetSources', 'keychain', 'walletSdk?'],
  public: true,
} as const satisfies Definition

export default seedBasedTransactionSignerDefinition
