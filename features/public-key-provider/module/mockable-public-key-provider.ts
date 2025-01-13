import type { PublicKeyProviderDependencies } from './public-key-provider.js'
import { PublicKeyProvider } from './public-key-provider.js'
import type { AddParams, GetParams, IPublicKeyStore } from './store/types.js'
import type { Logger } from 'libraries/atoms/lib/utils/types.js'
import type { WalletAccount } from '@exodus/models'
import type { Atom } from '@exodus/atoms'
import type { AssetsModule } from './utils/types.js'
import type { Definition } from '@exodus/dependency-types'
import pDefer from 'p-defer'

/** Purpose -> XPub */
type RawXPubMockAsset = Record<number, string>

type RawXPubMockAccount = {
  [assetName: string]: RawXPubMockAsset
}

type RawXPubMock = {
  [walletAccount: string]: RawXPubMockAccount
}

export type MockablePublicKeyProviderDependencies = PublicKeyProviderDependencies & {
  config: { xpubs?: RawXPubMock }
  assetsModule: AssetsModule
}

type MockedXPub = Pick<AddParams, 'walletAccount' | 'xpub' | 'keyIdentifier'>
type ClearParams = Pick<GetParams, 'walletAccountName' | 'keyIdentifier'>

/**
 * This class provides a dev interface for injecting mocked XPUB keys (Extended Public Keys).
 * @see {@link https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#user-content-Extended_keys|BIP32 - Extended keys}
 * @remarks
 * It can be either used via its exposed API, or through the IoC container by registering a "xpubs" definition.
 * @example
 * ```
 * container.register({
 *   id: 'xpubs',
 *   factory: () => {
 *     return {
 *       exodus_0: {
 *         bitcoin: {
 *           44: 'xpub6ByVzenfCtnyd48...'
 *         },
 *       },
 *     };
 *   }
 * })
 * ```
 */
export class MockablePublicKeyProvider extends PublicKeyProvider {
  public readonly onReady: Promise<unknown>

  readonly #publicKeyStore: IPublicKeyStore
  readonly #assetsModule: AssetsModule
  readonly #logger: Logger
  readonly #walletAccountsAtom: Atom<{
    [name: string]: WalletAccount
  }>

  constructor({
    config,
    assetsModule,
    publicKeyStore,
    walletAccountsAtom,
    logger,
    keychain,
    getBuildMetadata,
  }: MockablePublicKeyProviderDependencies) {
    super({ keychain, logger, walletAccountsAtom, publicKeyStore, getBuildMetadata })

    const deferred = pDefer()
    this.onReady = deferred.promise

    this.#assetsModule = assetsModule
    this.#publicKeyStore = publicKeyStore
    this.#walletAccountsAtom = walletAccountsAtom
    this.#logger = logger

    this.onReady = this.#ingestMocks(config.xpubs)
  }

  #processAssetSource = async (
    walletAccount: WalletAccount,
    assetName: string,
    details: RawXPubMockAsset
  ) => {
    const walletAccountName = walletAccount.toString()
    const asset = this.#assetsModule.getAsset(assetName)

    for (const [purpose, xpub] of Object.entries(details)) {
      const keyIdentifier = asset.baseAsset.api?.getKeyIdentifier({
        accountIndex: walletAccount.index,
        compatibilityMode: walletAccount.compatibilityMode,
        purpose: Number(purpose),
      })

      this.#logger.debug(
        'Mocking',
        assetName,
        'xpub with derivation path',
        keyIdentifier?.derivationPath,
        'for wallet account',
        walletAccountName
      )

      await this.#publicKeyStore.add({ walletAccount, keyIdentifier, xpub })
    }
  }

  #validateAccountType = (walletAccount: WalletAccount) => {
    if (!walletAccount.isSoftware) {
      throw new Error('mocking xpubs is currently only supported for software walletAccounts')
    }
  }

  #processAccount = async (walletAccount: WalletAccount, account: RawXPubMockAccount) => {
    this.#validateAccountType(walletAccount)
    return Promise.all(
      Object.entries(account).map(([assetName, details]) => {
        return this.#processAssetSource(walletAccount, assetName, details)
      })
    )
  }

  #ingestMocks = async (mockXPubs?: RawXPubMock) => {
    await this.#publicKeyStore.clearSoftwareWalletAccountKeys()
    if (!mockXPubs) {
      return
    }

    const walletAccounts = await this.#walletAccountsAtom.get()

    for (const [walletAccountName, account] of Object.entries(mockXPubs)) {
      const walletAccount = walletAccounts[walletAccountName]
      if (!walletAccount) {
        this.#logger.debug('Account not found, cannot mock XPUBs: ', walletAccountName)
        continue
      }

      await this.#processAccount(walletAccount, account)
    }
  }

  mockXPub = async (xpub: MockedXPub) => {
    this.#validateAccountType(xpub.walletAccount)
    await this.#publicKeyStore.add(xpub)
  }

  unmockXPub = async (params: ClearParams) => {
    return this.#publicKeyStore.delete(params)
  }

  clearAllMocks = async () => {
    await this.#publicKeyStore.clearSoftwareWalletAccountKeys()
  }
}

const factory = (dependencies: MockablePublicKeyProviderDependencies) =>
  new MockablePublicKeyProvider(dependencies)

const mockablePublicKeyProviderDefinition = {
  id: 'mockablePublicKeyProvider',
  type: 'module',
  factory,
  dependencies: [
    'publicKeyStore',
    'keychain',
    'walletAccountsAtom',
    'assetsModule',
    'logger',
    'config',
    'getBuildMetadata',
  ],
  public: true,
} as const satisfies Definition

export default mockablePublicKeyProviderDefinition
