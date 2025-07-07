import hardwareWalletsApiDefinition from './api/index.js'
import hardwareWalletsModuleDefinition from './module/hardware-wallets.js'
import {
  hardwareWalletConnectedAssetNamesAtomDefinition,
  hardwareWalletSigningRequestsAtomDefinition,
} from './atoms/index.js'
import hardwareWalletsPluginDefinition from './plugin/index.js'

const hardwareWallets = () => {
  return {
    id: 'hardwareWallets',
    definitions: [
      {
        definition: hardwareWalletsApiDefinition,
      },
      {
        definition: hardwareWalletsModuleDefinition,
      },
      {
        definition: hardwareWalletConnectedAssetNamesAtomDefinition,
      },
      {
        definition: hardwareWalletSigningRequestsAtomDefinition,
      },
      {
        definition: hardwareWalletsPluginDefinition,
      },
    ],
  } as const
}

export type HardwareWalletsApi = ReturnType<typeof hardwareWalletsApiDefinition.factory>

export default hardwareWallets
