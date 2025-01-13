import type { StorageFormatLegacy } from './formats/storage/legacy.js'
import { StorageFormatLegacyBuilder } from './formats/storage/legacy.js'
import serialization from './formats/serialization/index.js'

import type {
  AddParams,
  DeleteParams,
  GetParams,
  GetReturn,
  IPublicKeyStore,
  WalletAccounts,
} from './types.js'
import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { WalletAccount } from '@exodus/models'

export type Dependencies = {
  walletAccounts: WalletAccounts<StorageFormatLegacy>
  hardwareWalletPublicKeysAtom: Atom<StorageFormatLegacy>
  softwareWalletPublicKeysAtom: Atom<StorageFormatLegacy>
  walletAccountsAtom: Atom<Record<string, WalletAccount>>
}

class PublicKeyStore implements IPublicKeyStore {
  #walletAccounts: WalletAccounts<StorageFormatLegacy>
  #hardwareWalletPublicKeysAtom: Atom<StorageFormatLegacy>
  #softwareWalletPublicKeysAtom: Atom<StorageFormatLegacy>
  #walletAccountsAtom: Atom<Record<string, WalletAccount>>

  constructor({
    walletAccounts,
    hardwareWalletPublicKeysAtom,
    softwareWalletPublicKeysAtom,
    walletAccountsAtom,
  }: Dependencies) {
    this.#walletAccounts = walletAccounts
    this.#hardwareWalletPublicKeysAtom = hardwareWalletPublicKeysAtom
    this.#softwareWalletPublicKeysAtom = softwareWalletPublicKeysAtom
    this.#walletAccountsAtom = walletAccountsAtom
  }

  #getWalletAccount = async (walletAccountName: string) => {
    const walletAccounts = await this.#walletAccountsAtom.get()
    return walletAccounts[walletAccountName]
  }

  #getAtoms = (walletAccount?: WalletAccount) => {
    if (!walletAccount) {
      return [this.#hardwareWalletPublicKeysAtom, this.#softwareWalletPublicKeysAtom]
    }

    if (walletAccount.isHardware) {
      return [this.#hardwareWalletPublicKeysAtom]
    }

    if (walletAccount.isSoftware) {
      return [this.#softwareWalletPublicKeysAtom]
    }

    throw new Error('Wallet account is unsupported')
  }

  #getData = async (walletAccount?: WalletAccount): Promise<StorageFormatLegacyBuilder> => {
    const atoms = this.#getAtoms(walletAccount)
    const atomsData = await Promise.all(atoms.map((atom) => atom.get()))
    const data = atomsData.reduce((merged, atom) => ({ ...merged, ...atom }), {})

    return new StorageFormatLegacyBuilder({ data })
  }

  #setData = async (publicKeyStore: StorageFormatLegacyBuilder, walletAccount: WalletAccount) => {
    const data = publicKeyStore.serialize()
    if (walletAccount.isSoftware) {
      return this.#softwareWalletPublicKeysAtom.set(data)
    }

    if (walletAccount.isHardware) {
      return this.#walletAccounts.setAccounts(data)
    }

    throw new Error('Wallet account is unsupported')
  }

  add = async ({ walletAccount, ...params }: AddParams) => {
    const publicKeyStore = await this.#getData(walletAccount)
    const xpub = params.xpub ? serialization.xpub.serialize(params.xpub) : undefined
    const publicKey = params.publicKey
      ? serialization.publicKey.serialize(params.publicKey)
      : undefined

    publicKeyStore.add({ ...params, publicKey, xpub, walletAccountName: walletAccount.toString() })
    await this.#setData(publicKeyStore, walletAccount)
  }

  get = async (params: GetParams): Promise<GetReturn> => {
    const walletAccount = await this.#getWalletAccount(params.walletAccountName)

    if (!walletAccount) {
      return null
    }

    const publicKeyStore = await this.#getData(walletAccount)
    const entry = publicKeyStore.get(params)

    if (!entry) {
      return null
    }

    const { publicKey, xpub } = entry
    if (!publicKey && !xpub) {
      return null
    }

    const deserialized = Object.create(null)
    if (xpub) {
      deserialized.xpub = serialization.xpub.deserialize(xpub)
    }

    if (publicKey) {
      deserialized.publicKey = serialization.publicKey.deserialize(publicKey)
    }

    return deserialized
  }

  delete = async (params: DeleteParams) => {
    const walletAccount = await this.#getWalletAccount(params.walletAccountName)
    if (!walletAccount) {
      throw new Error(`Wallet account not found: ${params.walletAccountName}`)
    }

    const publicKeyStore = await this.#getData(walletAccount)
    publicKeyStore.delete(params)
    await this.#setData(publicKeyStore, walletAccount)
  }

  clearSoftwareWalletAccountKeys = async () => {
    const empty = new StorageFormatLegacyBuilder().serialize()
    await this.#softwareWalletPublicKeysAtom.set(empty)
  }
}

const createPublicKeyStore = (deps: Dependencies) => new PublicKeyStore({ ...deps })

const publicKeyStoreDefinition = {
  id: 'publicKeyStore',
  type: 'module',
  factory: createPublicKeyStore,
  dependencies: [
    'walletAccounts',
    'hardwareWalletPublicKeysAtom',
    'softwareWalletPublicKeysAtom',
    'walletAccountsAtom',
  ],
  public: true,
} as const satisfies Definition

export default publicKeyStoreDefinition
