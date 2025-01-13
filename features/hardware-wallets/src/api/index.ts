import type { Definition } from '@exodus/dependency-types'
import type { HardwareWallets } from '../module/hardware-wallets.js'

const createHardwareWalletsApi = ({
  hardwareWallets,
  restoreProgressTracker,
  txLogMonitors,
}: {
  hardwareWallets: HardwareWallets
  txLogMonitors: any
  restoreProgressTracker: any
}) => {
  hardwareWallets.events.subscribe(({ type, payload }) => {
    if (type !== 'syncAssets') return
    const { assetNames } = payload
    // TODO: remove this workaround. circular dependency
    // assetClientInterface -> transactionSigner -> hardwareWallets -> txLogMonitors -> assetClientInterface
    // https://github.com/ExodusMovement/assets/issues/3139
    for (const assetName of assetNames) {
      // eslint-disable-next-line @exodus/hydra/no-asset-conditions
      if (assetName === 'ethereum' || assetName === 'matic') {
        // Ethereum, matic and other EVMs may share the same address so syncing one
        // may also syncs the others. We do a little bit of magic here to make that happen.
        // TODO: generalize this logic so we don't need asset name logic
        restoreProgressTracker.restoreAsset('ethereum')
        restoreProgressTracker.restoreAsset('matic')
        txLogMonitors.update({ assetName: 'ethereum', refresh: true })
        txLogMonitors.update({ assetName: 'matic', refresh: true })
      } else {
        restoreProgressTracker.restoreAsset(assetName)
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
      ensureApplicationIsOpened: hardwareWallets.ensureApplicationIsOpened,
      scan: hardwareWallets.scan,
      sync: hardwareWallets.sync,
      addPublicKeysToWalletAccount: hardwareWallets.addPublicKeysToWalletAccount,
      create: hardwareWallets.create,
    },
  }
}

const hardwareWalletsApiDefinition = {
  id: 'hardwareWalletsApi',
  type: 'api',
  factory: createHardwareWalletsApi,
  dependencies: ['hardwareWallets', 'txLogMonitors', 'restoreProgressTracker'],
} as const satisfies Definition

export default hardwareWalletsApiDefinition
