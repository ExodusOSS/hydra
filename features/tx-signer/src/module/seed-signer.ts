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

  constructor({ assetsModule, assetSources, keychain }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#assetSources = assetSources
    this.#keychain = keychain
  }

  async #getSignerForWalletAccount({
    baseAsset,
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

    return this.#createSigner({ seedId, getDefaultKeyIdentifier })
  }

  async #getSignerForKeyId({ seedId, keyId }: { seedId?: string; keyId: KeyIdentifier }) {
    return this.#createSigner({ seedId, getDefaultKeyIdentifier: () => new KeyIdentifier(keyId) })
  }

  #createSigner({
    seedId,
    getDefaultKeyIdentifier,
  }: {
    seedId?: string
    getDefaultKeyIdentifier: () => KeyIdentifier
  }) {
    const getPublicKey = async ({
      keyId = getDefaultKeyIdentifier(),
    }: GetPublicKeyParams = {}): Promise<Buffer> => {
      return this.#keychain.getPublicKey({ seedId, keyId })
    }

    const sign = ({
      data,
      keyId = getDefaultKeyIdentifier(),
      signatureType,
      enc,
      tweak,
      extraEntropy,
    }: KeychainSignerParams): Promise<any> => {
      assert(KeyIdentifier.validate(keyId), 'signBuffer: invalid `keyId`')

      if (!signatureType) {
        // temporary because some assets (algorand) do not pass signatureType
        signatureType = keyId.keyType === 'secp256k1' ? 'ecdsa' : 'ed25519'
      }

      return this.#keychain.signBuffer({
        seedId,
        keyId,
        data,
        signatureType,
        enc,
        tweak,
        extraEntropy,
      })
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

    assert(baseAsset.api.features.signWithSigner, `asset ${baseAssetName} does not support signing`)

    const keyId = unsignedTx.txMeta?.keyId
    const signTx = baseAsset.api.signTx!

    if (!keyId) {
      const signer = await this.#getSignerForWalletAccount({ walletAccount, baseAsset })
      return signTx({ unsignedTx, signer })
    }

    // Sometimes we need a different keyId than the default.
    // One example is signing an EOS tx with the Ethereum key, another is ripple:
    // https://github.com/ExodusMovement/exodus-desktop/blob/174efe1145152446e6183f55155972b3acc05ccc/src/app/_local_modules/eosio-write-api/fallback-claim.js#L54
    // https://github.com/ExodusMovement/exodus-desktop/blob/82f1e284efed2bf1ff95798a9e8e89bc71e2ae40/src/app/ui/exodus-global/debug/ripple.js#L105
    assert(KeyIdentifier.validate(keyId), `txMeta.keyId must be a key identifier object`)

    const signer = await this.#getSignerForKeyId({ seedId: walletAccount.seedId, keyId })
    return signTx({ unsignedTx, signer })
  }
}

const createSeedBasedTransactionSigner = (opts: Dependencies) =>
  new SeedBasedTransactionSigner(opts)

const seedBasedTransactionSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createSeedBasedTransactionSigner,
  dependencies: ['assetsModule', 'assetSources', 'keychain'],
  public: true,
} as const satisfies Definition

export default seedBasedTransactionSignerDefinition
