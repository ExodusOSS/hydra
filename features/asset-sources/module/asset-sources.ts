import typeforce from '@exodus/typeforce'
import type { Atom } from '@exodus/atoms'
import type { WalletAccount } from '@exodus/models'
import { types } from './types.js'
import type {
  AssetSource,
  Assets,
  Asset,
  AvailableAssetNamesByWalletAccount,
  WalletAccounts,
} from '../types.js'
import { getSupportedPurposes } from './utils.js'
import {
  UnknownWalletAccountError,
  UnsupportedAssetError,
  UnsupportedAssetSourceError,
} from './errors.js'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'assetSources'

type AssetsAtom = Atom<{ value: Assets }>

type Dependencies = {
  assetsAtom: AssetsAtom
  walletAccountsAtom: Atom<WalletAccounts>
  availableAssetNamesByWalletAccountAtom: Atom<AvailableAssetNamesByWalletAccount>
}

class AssetSources {
  #assetsAtom: AssetsAtom
  #walletAccountsAtom
  #availableAssetNamesByWalletAccountAtom

  constructor({
    assetsAtom,
    walletAccountsAtom,
    availableAssetNamesByWalletAccountAtom,
  }: Dependencies) {
    this.#assetsAtom = assetsAtom
    this.#walletAccountsAtom = walletAccountsAtom
    this.#availableAssetNamesByWalletAccountAtom = availableAssetNamesByWalletAccountAtom
  }

  #getAsset = async (assetName: string): Promise<Asset> => {
    const { value: assets } = await this.#assetsAtom.get()
    const asset = assets[assetName]
    if (!asset) {
      throw new UnsupportedAssetError(assetName)
    }

    return asset
  }

  #getWalletAccount = async (walletAccount: string): Promise<WalletAccount> => {
    const all = await this.#walletAccountsAtom.get()
    if (!all[walletAccount]) {
      throw new UnknownWalletAccountError(walletAccount)
    }

    return all[walletAccount]!
  }

  getSupportedPurposes = async ({ walletAccount, assetName }: AssetSource): Promise<number[]> => {
    typeforce(types.assetSource, { walletAccount, assetName }, true)

    const walletAccountInstance = await this.#getWalletAccount(walletAccount)
    return getSupportedPurposes({
      asset: await this.#getAsset(assetName),
      walletAccount: walletAccountInstance,
    })
  }

  getDefaultPurpose = async ({ walletAccount, assetName }: AssetSource): Promise<number> => {
    typeforce(types.assetSource, { walletAccount, assetName }, true)

    const [defaultPurpose] = await this.getSupportedPurposes({ walletAccount, assetName })
    if (typeof defaultPurpose !== 'number') {
      throw new UnsupportedAssetSourceError({ walletAccount, assetName })
    }

    return defaultPurpose
  }

  isSupported = async ({ walletAccount, assetName }: AssetSource): Promise<boolean> => {
    typeforce(types.assetSource, { walletAccount, assetName }, true)
    const { [walletAccount]: availableAssetNames } =
      await this.#availableAssetNamesByWalletAccountAtom.get()

    return Boolean(availableAssetNames?.includes(assetName))
  }
}

const createAssetSources = (opts: Dependencies) => new AssetSources(opts)

const assetSourcesDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createAssetSources,
  dependencies: ['assetsAtom', 'walletAccountsAtom', 'availableAssetNamesByWalletAccountAtom'],
  public: true,
} as const satisfies Definition

export type { AssetSources }

export default assetSourcesDefinition
