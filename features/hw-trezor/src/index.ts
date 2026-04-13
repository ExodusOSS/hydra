import {
  hardwareWalletThpCredentialsAtomDefinition,
  hardwareWalletPairingPromptAtomDefinition,
} from './atoms'
import trezorDiscoveryDefinition from './module'
import hardwareWalletTrezorPluginDefinition from './plugin'

import type { Feature } from '@exodus/dependency-types'

export type HwTrezorConfig = {
  transportType: string
  bluetoothScannerTimeout: number
}

const hardwareWalletTrezor = ({
  transportType = 'bluetooth',
  bluetoothScannerTimeout = 10_000,
}: Partial<HwTrezorConfig> = {}) => {
  return {
    id: 'hardwareWalletTrezor',
    definitions: [
      {
        definition: hardwareWalletThpCredentialsAtomDefinition,
      },
      {
        definition: hardwareWalletPairingPromptAtomDefinition,
      },
      {
        definition: trezorDiscoveryDefinition,
        config: { bluetoothScannerTimeout, transportType },
      },
      {
        definition: hardwareWalletTrezorPluginDefinition,
      },
    ],
  } as const satisfies Feature
}

export default hardwareWalletTrezor
