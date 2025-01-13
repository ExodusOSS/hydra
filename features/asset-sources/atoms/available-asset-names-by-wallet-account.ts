import { createMeta } from '@exodus/trezor-meta'
import { combine, compute, dedupe } from '@exodus/atoms'
import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import { mapValues, intersection, memoize } from '@exodus/basic-utils'
import type { Assets, WalletAccounts, AvailableAssetNamesByWalletAccount } from '../types.js'
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

const memoizedGetTrezorAvailableAssets = memoize(
  (assets: Assets, model: TrezorModels | undefined, availableAssetNames: string[]) => {
    const { ASSETS_BY_MODEL } = createMeta(assets)
    const legacySupportedAssetNames = new Set(ASSETS_BY_MODEL[model!] || ASSETS_BY_MODEL.T)

    const supportedAssetNames = getSupportedAssetNames(assets, 'trezor', model!)
    const finalSupportedAssetNames = [
      ...new Set([...legacySupportedAssetNames, ...supportedAssetNames]),
    ]
    return intersection(finalSupportedAssetNames, availableAssetNames)
  },
  (assets: Assets, model: string | undefined, availableAssetNames: string[]) =>
    `${Object.keys(assets).join(',')}_${model}_${availableAssetNames.join(',')}`
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

const memoizedGetLedgerAvailableAssets = memoize(
  (assets: Assets, model: LedgerModels | undefined, availableAssetNames: string[]) => {
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
  },
  (assets: Assets, model: string, availableAssetNames: string[]) =>
    `${Object.keys(assets).join(',')}_${model}_${availableAssetNames.join(',')}`
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
            return memoizedGetTrezorAvailableAssets(assets.value, model, availableAssetNames)
          }

          if (source === WalletAccount.LEDGER_SRC) {
            return memoizedGetLedgerAvailableAssets(assets.value, model, availableAssetNames)
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
