import type { Definition } from '@exodus/dependency-types'
import type { HardwareWallets } from '../module/hardware-wallets.js'

const createHardwareWalletsApi = ({
  hardwareWallets,
  restoreAssetsTracker,
  txLogMonitors,
}: {
  hardwareWallets: HardwareWallets
  txLogMonitors: any
  restoreAssetsTracker: any
}) => {
  hardwareWallets.events.subscribe(({ type, payload }) => {
    if (type !== 'syncAssets') return
    const { assetNames } = payload
    // TODO: remove this workaround. circular dependency
    // assetClientInterface -> transactionSigner -> hardwareWallets -> txLogMonitors -> assetClientInterface
    // https://github.com/ExodusMovement/assets/issues/3139
    for (const assetName of assetNames) {
      // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/no-asset-conditions
      if (assetName === 'ethereum' || assetName === 'matic') {
        // Ethereum, matic and other EVMs may share the same address so syncing one
        // may also syncs the others. We do a little bit of magic here to make that happen.
        // TODO: generalize this logic so we don't need asset name logic
        restoreAssetsTracker.restoreAsset('ethereum')
        restoreAssetsTracker.restoreAsset('matic')
        txLogMonitors.update({ assetName: 'ethereum', refresh: true })
        txLogMonitors.update({ assetName: 'matic', refresh: true })
      } else {
        restoreAssetsTracker.restoreAsset(assetName)
        txLogMonitors.update({ assetName, refresh: true })
      }
    }
  })

  return {
    hardwareWallets: {
      isDeviceConnected: hardwareWallets.isDeviceConnected,
      getAvailableDevices: hardwareWallets.getAvailableDevices,
      listUseableAssetNames: hardwareWallets.listUseableAssetNames,
      scanForDevices: hardwareWallets.scanForDevices,
      canAccessAsset: hardwareWallets.canAccessAsset,
      scan: hardwareWallets.scan,
      sync: hardwareWallets.sync,
      addPublicKeysToWalletAccount: hardwareWallets.addPublicKeysToWalletAccount,
      create: hardwareWallets.create,
      retrySigningRequest: hardwareWallets.retrySigningRequest,
      cancelSigningRequest: hardwareWallets.cancelSigningRequest,
      submitPairingCode: hardwareWallets.submitPairingCode,
      clearPairingRequest: () => hardwareWallets.clearPairingRequest,
      setPassphraseMode: hardwareWallets.setPassphraseMode,
    },
  }
}

const hardwareWalletsApiDefinition = {
  id: 'hardwareWalletsApi',
  type: 'api',
  factory: createHardwareWalletsApi,
  dependencies: ['hardwareWallets', 'txLogMonitors', 'restoreAssetsTracker'],
} as const satisfies Definition

export default hardwareWalletsApiDefinition
