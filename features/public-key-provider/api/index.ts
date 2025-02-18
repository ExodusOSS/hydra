import type { Definition } from '@exodus/dependency-types'
import type { PublicKeyProvider } from '../module/public-key-provider.js'
import type { AssetsModule, AssetSources } from '../module/utils/types.js'
import type { Atom } from '@exodus/atoms'
import type { WalletAccount } from '@exodus/models'
import assert from 'minimalistic-assert'
import { getDefaultPathIndexes } from '@exodus/asset-lib'

type Dependencies = {
  publicKeyProvider: PublicKeyProvider
  assetsModule: AssetsModule
  assetSources: AssetSources
  walletAccountsAtom: Atom<Record<string, WalletAccount>>
}

type ApiParams = {
  /** @sample "exodus_0" */
  walletAccount: string
  /** @sample "ethereum" */
  assetName: string
  purpose?: number
  chainIndex?: number
  addressIndex?: number
}

type GetKeyParams = Parameters<PublicKeyProvider['getPublicKey']>[0] | ApiParams

export interface PublicKeyProviderApi {
  publicKeyProvider: {
    /**
     * Returns the public key for either a key identifier or the default key identifier for an asset
     */
    getPublicKey(params: GetKeyParams): ReturnType<PublicKeyProvider['getPublicKey']>
    /**
     * Returns the extended public key (xpub) for either a key identifier or the default key identifier for an asset
     * @example ```ts
     * exodus.publicKeyProvider.getExtendedPublicKey({ walletAccount: 'exodus_0', assetName: 'bitcoin' })
     * ```
     */
    getExtendedPublicKey(
      params: GetKeyParams
    ): ReturnType<PublicKeyProvider['getExtendedPublicKey']>
  }
}

const createPublicKeyProviderApi = ({
  publicKeyProvider,
  assetSources,
  assetsModule,
  walletAccountsAtom,
}: Dependencies): PublicKeyProviderApi => {
  const getKeyIdentifier = async (params: ApiParams) => {
    const { walletAccount: walletAccountName, assetName } = params
    const walletAccounts = await walletAccountsAtom.get()
    const asset = assetsModule.getAsset(assetName)
    const walletAccount = walletAccounts[walletAccountName]
    assert(walletAccount, `Unknown wallet account: ${walletAccountName}`)

    const { chainIndex: defaultChainIndex, addressIndex: defaultAddressIndex } =
      getDefaultPathIndexes({
        asset,
        walletAccount,
        compatibilityMode: walletAccount.compatibilityMode,
      })

    const {
      purpose = await assetSources.getDefaultPurpose({
        walletAccount: walletAccountName,
        assetName,
      }),
      chainIndex = defaultChainIndex,
      addressIndex = defaultAddressIndex,
    } = params

    return asset.api!.getKeyIdentifier({
      purpose,
      accountIndex: walletAccount.index!,
      chainIndex,
      addressIndex,
      compatibilityMode: walletAccount.compatibilityMode,
    })
  }

  return {
    publicKeyProvider: {
      async getPublicKey(params: GetKeyParams) {
        if ('keyIdentifier' in params) {
          return publicKeyProvider.getPublicKey(params)
        }

        return publicKeyProvider.getPublicKey({
          keyIdentifier: await getKeyIdentifier(params),
          walletAccount: params.walletAccount,
        })
      },
      async getExtendedPublicKey(params: GetKeyParams) {
        if ('keyIdentifier' in params) {
          return publicKeyProvider.getExtendedPublicKey(params)
        }

        return publicKeyProvider.getExtendedPublicKey({
          keyIdentifier: await getKeyIdentifier(params),
          walletAccount: params.walletAccount,
        })
      },
    },
  }
}

const publicKeyProviderApiDefinition = {
  id: 'publicKeyProviderApi',
  type: 'api',
  factory: createPublicKeyProviderApi,
  dependencies: ['publicKeyProvider', 'assetSources', 'assetsModule', 'walletAccountsAtom'],
} as const satisfies Definition

export default publicKeyProviderApiDefinition
