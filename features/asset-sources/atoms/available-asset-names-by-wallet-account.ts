import { createMeta } from '@exodus/trezor-meta'
import { combine, compute, dedupe } from '@exodus/atoms'
import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import { mapValues, intersection } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import type { Assets, Asset, WalletAccounts, AvailableAssetNamesByWalletAccount } from '../types.js'
import { WalletAccount } from '@exodus/models'
import type { Definition } from '@exodus/dependency-types'
import type { HardwareWalletManufacturer, LedgerModels, TrezorModels } from '@exodus/hw-common'

type AssetsAtom = Atom<{ value: Assets }>

type Dependencies = {
  assetsAtom: AssetsAtom
  availableAssetNamesAtom: Atom<string[]>
  enabledWalletAccountsAtom: Atom<WalletAccounts>
}

type CombinedAtomResult = {
  assets: { value: Assets }
  walletAccounts: WalletAccounts
  availableAssetNames: string[]
}

type TrezorSelectorState = {
  assets: Assets
  model: TrezorModels | undefined
  availableAssetNames: string[]
}

type LedgerSelectorState = {
  assets: Assets
  model: LedgerModels | undefined
  availableAssetNames: string[]
}

type PasskeysSelectorState = {
  assets: Assets
  availableAssetNames: string[]
}

const getSupportedAssetNames = (
  assets: Assets,
  manufacturer: HardwareWalletManufacturer,
  model: TrezorModels | LedgerModels
) => {
  return Object.values(assets)
    .filter((asset) =>
      asset.baseAsset.api?.features?.hardwareWallets?.supportMatrix[manufacturer]?.models.includes(
        model
      )
    )
    .map((asset) => asset.name)
}

const trezorAvailableAssetsSelector = createSelector(
  (state: TrezorSelectorState) => state.assets,
  (state: TrezorSelectorState) => state.model,
  (state: TrezorSelectorState) => state.availableAssetNames,
  (assets, model, availableAssetNames) => {
    const { ASSETS_BY_MODEL } = createMeta(assets)
    const legacySupportedAssetNames = new Set(ASSETS_BY_MODEL[model!] || ASSETS_BY_MODEL.T)

    const supportedAssetNames = getSupportedAssetNames(assets, 'trezor', model!)
    const finalSupportedAssetNames = [
      ...new Set([...legacySupportedAssetNames, ...supportedAssetNames]),
    ]
    return intersection(finalSupportedAssetNames, availableAssetNames)
  }
)

const legacyLedgerSupportedAssets = new Set([
  'basemainnet',
  'bitcoin',
  'bitcoinregtest',
  'bitcointestnet',
  'ethereum',
  'ethereumsepolia',
  'solana',
  'matic',
])

const ledgerAvailableAssetsSelector = createSelector(
  (state: LedgerSelectorState) => state.assets,
  (state: LedgerSelectorState) => state.model,
  (state: LedgerSelectorState) => state.availableAssetNames,
  (assets, model, availableAssetNames) => {
    const legacySupportedAssetNames = new Set(
      Object.values(assets)
        .filter((asset) => legacyLedgerSupportedAssets.has(asset.baseAssetName))
        .map((asset) => asset.name)
    )

    const supportedAssetNames = getSupportedAssetNames(assets, 'ledger', model!)
    const finalSupportedAssetNames = [
      ...new Set([...legacySupportedAssetNames, ...supportedAssetNames]),
    ]
    return intersection(finalSupportedAssetNames, availableAssetNames)
  }
)

const passkeysAvailableAssetsSelector = createSelector(
  (state: PasskeysSelectorState) => state.assets,
  (state: PasskeysSelectorState) => state.availableAssetNames,
  (assets, availableAssetNames) => {
    return availableAssetNames.filter((name) => {
      const asset = assets[name]
      if (!asset) {
        return false
      }

      const check = (asset: Asset) => {
        const baseAsset = asset.baseAsset
        return Boolean(baseAsset.api?.features?.signWithSigner && baseAsset.api.signTx)
      }

      if (asset.isCombined) {
        return asset.combinedAssetNames!.some((name: string) => {
          const childAsset = assets[name]
          return childAsset ? check(childAsset) : false
        })
      }

      return check(asset)
    })
  }
)

const createAvailableAssetNamesByWalletAccountAtom = ({
  assetsAtom,
  availableAssetNamesAtom,
  enabledWalletAccountsAtom,
}: Dependencies): ReadonlyAtom<AvailableAssetNamesByWalletAccount> =>
  dedupe(
    compute({
      atom: <Atom<CombinedAtomResult>>combine({
        walletAccounts: enabledWalletAccountsAtom,
        availableAssetNames: availableAssetNamesAtom,
        assets: assetsAtom,
      }),
      selector: ({ assets, walletAccounts, availableAssetNames }: CombinedAtomResult) => {
        return mapValues(walletAccounts, ({ source, model }: WalletAccount) => {
          if (source === WalletAccount.TREZOR_SRC) {
            return trezorAvailableAssetsSelector({
              assets: assets.value,
              model: model as TrezorModels | undefined,
              availableAssetNames,
            })
          }

          if (source === WalletAccount.LEDGER_SRC) {
            return ledgerAvailableAssetsSelector({
              assets: assets.value,
              model: model as LedgerModels | undefined,
              availableAssetNames,
            })
          }

          if (source === WalletAccount.PASSKEY_SRC) {
            return passkeysAvailableAssetsSelector({
              assets: assets.value,
              availableAssetNames,
            })
          }

          return availableAssetNames
        })
      },
    }) as Atom<AvailableAssetNamesByWalletAccount>
  ) as ReadonlyAtom<AvailableAssetNamesByWalletAccount>

export const availableAssetNamesByWalletAccountAtomDefinition = {
  id: 'availableAssetNamesByWalletAccountAtom',
  type: 'atom',
  factory: createAvailableAssetNamesByWalletAccountAtom,
  dependencies: ['assetsAtom', 'availableAssetNamesAtom', 'enabledWalletAccountsAtom'],
  public: true,
} as const satisfies Definition
