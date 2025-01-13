import type { Keychain } from '@exodus/keychain/module'
import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'
import { derivationPathsWithHardenedPrefix } from './utils/bip32.js'
import BIP32 from '@exodus/bip32'
import BipPath from 'bip32-path'
import type { Atom } from '@exodus/atoms'
import type { WalletAccount } from '@exodus/models'
import type { Definition } from '@exodus/dependency-types'
import type { GetParams, GetReturn, IPublicKeyStore } from './store/types.js'
import type { Logger } from 'libraries/atoms/lib/utils/types.js'

export type BuildMetadata = {
  dev?: boolean
}

export type GetBuildMetadata = () => Promise<BuildMetadata>

export type PublicKeyProviderDependencies = {
  publicKeyStore: IPublicKeyStore
  keychain: Keychain
  getBuildMetadata: GetBuildMetadata
  walletAccountsAtom: Atom<{
    [name: string]: WalletAccount
  }>
  logger: Logger
}

type GetPublicKeyParams = {
  keyIdentifier: KeyIdentifier
  walletAccount: string
}

type PublicKeys = NonNullable<GetReturn>

export class PublicKeyProvider {
  readonly #publicKeyStore
  readonly #keychain
  readonly #walletAccountsAtom
  readonly #logger
  readonly #getBuildMetadata

  constructor({
    publicKeyStore,
    keychain,
    walletAccountsAtom,
    logger,
    getBuildMetadata,
  }: PublicKeyProviderDependencies) {
    this.#publicKeyStore = publicKeyStore
    this.#keychain = keychain
    this.#walletAccountsAtom = walletAccountsAtom
    this.#logger = logger
    this.#getBuildMetadata = getBuildMetadata
  }

  getExtendedPublicKey = async ({
    walletAccount,
    keyIdentifier,
  }: GetPublicKeyParams): Promise<PublicKeys['xpub']> => {
    const { xpub } = await this.#exportPublic({ walletAccount, keyIdentifier })
    return xpub
  }

  getPublicKey = async ({
    walletAccount,
    keyIdentifier,
  }: GetPublicKeyParams): Promise<PublicKeys['publicKey']> => {
    const { publicKey } = await this.#exportPublic({ walletAccount, keyIdentifier })
    return publicKey
  }

  /**
   * Gradually chops of one part of the derivation path and check if we have an xpub stored for the reduced path.
   * If we find one, we derive the requested public key from the xpub using the partial path that was chopped of from the initially requested derivation path.
   * We stop traversing at the first hardened index, because hardened derivation is not possible without a private key.
   */
  #traversePathForXpub = async ({ keyIdentifier, walletAccountName }: GetParams) => {
    if (keyIdentifier.derivationAlgorithm === 'BIP32' && keyIdentifier.keyType === 'secp256k1') {
      for (const { derivationPath, removedIndices } of derivationPathsWithHardenedPrefix(
        keyIdentifier.derivationPath
      )) {
        const xpubKeyIdentifier = new KeyIdentifier({
          ...keyIdentifier,
          derivationPath,
        })

        const entry = await this.#publicKeyStore.get({
          walletAccountName,
          keyIdentifier: xpubKeyIdentifier,
        })

        if (entry?.xpub) {
          const path = BipPath.fromPathArray(removedIndices.map(Number)).toString()
          const { publicKey, xPub: xpub } = BIP32.fromXPub(entry.xpub).derive(path)
          return { publicKey, xpub }
        }
      }
    }
  }

  #getCachedPublicKey = async (params: GetParams) => {
    const cached = await this.#publicKeyStore.get(params)

    if (cached) {
      return cached
    }

    return this.#traversePathForXpub(params)
  }

  #exportPublic = async ({
    walletAccount: walletAccountName,
    keyIdentifier,
  }: GetPublicKeyParams): Promise<PublicKeys> => {
    assert(walletAccountName, 'Missing required param "walletAccount"')
    assert(keyIdentifier, 'Missing required param "keyIdentifier"')

    // backwards compat for callers that today pass a WalletAccount instance
    if (typeof walletAccountName !== 'string') {
      this.#logger.warn('expected walletAccount to be a string', walletAccountName)
      walletAccountName = (<WalletAccount>walletAccountName).toString()
    }

    const walletAccounts = await this.#walletAccountsAtom.get()
    const walletAccount = walletAccounts[walletAccountName]
    assert(walletAccount, `Wallet account with name ${walletAccountName} does not exist`)

    // Ensure key identifier is of the right type and frozen
    keyIdentifier = new KeyIdentifier(keyIdentifier)

    const buildMetadata = await this.#getBuildMetadata()

    if (buildMetadata.dev || walletAccount.isHardware) {
      const cached = await this.#getCachedPublicKey({
        keyIdentifier,
        walletAccountName,
      })
      if (cached) {
        return cached
      }
    }

    if (walletAccount.isSoftware) {
      const { publicKey, xpub } = await this.#keychain.exportKey({
        keyId: keyIdentifier,
        seedId: walletAccount.seedId,
      })

      // Don't wait to avoid extra latency
      void this.#publicKeyStore.add({
        walletAccount,
        keyIdentifier,
        publicKey,
        xpub,
      })
      return { publicKey, xpub }
    }

    throw new Error(
      `No public key found for ${walletAccountName} and key identifier ${keyIdentifier.derivationPath} (${keyIdentifier.derivationAlgorithm})`
    )
  }
}

const createPublicKeyProvider = (dependencies: PublicKeyProviderDependencies) =>
  new PublicKeyProvider(dependencies)

const publicKeyProviderDefinition = {
  id: 'publicKeyProvider',
  type: 'module',
  factory: createPublicKeyProvider,
  dependencies: ['publicKeyStore', 'keychain', 'walletAccountsAtom', 'logger', 'getBuildMetadata'],
  public: true,
} as const satisfies Definition

export default publicKeyProviderDefinition
