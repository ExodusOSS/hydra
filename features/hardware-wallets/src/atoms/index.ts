import { combine, compute } from '@exodus/atoms'
import { memoize } from '@exodus/basic-utils'
import type { Definition } from '@exodus/dependency-types'
import { HARDENED_OFFSET } from '@exodus/bip32'

type WalletAccountName = string
type AssetName = string
export type WalletAccountNameToConnectedAssetNamesMap = Record<WalletAccountName, AssetName[]>

/**
 * This atom stores the asset names that have been synced for each hardware wallet account.
 * Recomputed on every change of the atom dependencies. We determine whether an asset is synced by checking if we have the
 * public key associated with key identifier in our public key store, if we do, then we consider it
 * synced. Multiple assets may share the same key identifiers & public keys (EVMs, for example).
 */
export const createHardwareWalletConnectedAssetNamesAtom = ({
  assetsModule,
  hardwareWalletPublicKeysAtom,
  walletAccountsAtom,
}: any) => {
  const selector = memoize(
    ({ hardwareWalletPublicKeys, walletAccounts }: any) => {
      const result: WalletAccountNameToConnectedAssetNamesMap = Object.create(null)

      // Retrieve the assets from the assets module
      // and compute the base assets
      const assets = assetsModule.getAssets()

      for (const [walletAccountName, walletAccount] of Object.entries(walletAccounts) as any) {
        // Not a hardware wallet account
        if (!walletAccount.isHardware) {
          continue
        }

        // No public keys for this wallet account
        const derivationPaths = Object.keys(
          hardwareWalletPublicKeys[walletAccountName] ?? Object.create(null)
        )
        if (derivationPaths.length === 0) {
          continue
        }

        // Extract all BIP-44 values from the derivation paths
        const bip44Regex = /^m\/\d+'\/(\d+)'/u
        const bip44Values = new Set(
          derivationPaths
            .map((path) => {
              const match = path.match(bip44Regex)
              return match ? match[1] : null // Returns the BIP-44 number or null if not found
            })
            .filter(Boolean)
        )

        const syncedAssetNames = Object.values(assets)
          .filter((asset: any) => bip44Values.has(String(asset.baseAsset.bip44 - HARDENED_OFFSET)))
          .map((asset: any) => asset.name)

        result[walletAccountName] = syncedAssetNames
      }

      return result
    },
    (deps: any) => JSON.stringify(deps)
  )

  return compute({
    atom: combine({
      hardwareWalletPublicKeys: hardwareWalletPublicKeysAtom,
      walletAccounts: walletAccountsAtom,
    }),
    selector,
  })
}

export const hardwareWalletConnectedAssetNamesAtomDefinition = {
  id: 'hardwareWalletConnectedAssetNamesAtom',
  type: 'atom',
  factory: createHardwareWalletConnectedAssetNamesAtom,
  dependencies: ['hardwareWalletPublicKeysAtom', 'assetsModule', 'walletAccountsAtom'],
} as const satisfies Definition
