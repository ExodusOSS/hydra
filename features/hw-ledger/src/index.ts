import {
  bluetoothStatusAtomDefinition,
  bluetoothScanningAtomDefinition,
  walletPolicyAtomDefinition,
} from './atoms'
import ledgerDiscoveryDefinition from './module'
import hardwareWalletLedgerPluginDefinition from './plugin'

import type { Feature } from '@exodus/dependency-types'
import type { HwLedgerConfig } from './module/types'

const hardwareWalletLedger = ({
  bluetoothScannerTimeout = 10_000,
}: Partial<HwLedgerConfig> = {}) => {
  return {
    id: 'hardwareWalletLedger',
    definitions: [
      {
        definition: bluetoothStatusAtomDefinition,
      },
      {
        definition: bluetoothScanningAtomDefinition,
      },
      {
        definition: walletPolicyAtomDefinition,
      },
      {
        definition: hardwareWalletLedgerPluginDefinition,
      },
      {
        definition: ledgerDiscoveryDefinition,
        config: { bluetoothScannerTimeout },
      },
    ],
  } as const satisfies Feature
}

export default hardwareWalletLedger
