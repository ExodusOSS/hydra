import { createInMemoryAtom, createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from 'adapters/storage-interface'
import type { Definition } from '@exodus/dependency-types'

export type BluetoothStatus = {
  type: 'Unknown' | 'Resetting' | 'Unsupported' | 'Unauthorized' | 'PoweredOff' | 'PoweredOn'
  available: boolean
}

export const bluetoothStatusAtomDefinition = {
  id: 'bluetoothStatusAtom',
  type: 'atom',
  factory: () =>
    createInMemoryAtom<BluetoothStatus>({
      defaultValue: { type: 'Unknown', available: false },
    }),
  dependencies: [],
  public: true,
} as const satisfies Definition

export const bluetoothScanningAtomDefinition = {
  id: 'bluetoothScanningAtom',
  type: 'atom',
  factory: () => createInMemoryAtom<boolean>({ defaultValue: false }),
  dependencies: [],
  public: true,
} as const satisfies Definition

type Params = {
  storage: Storage<Record<string, Buffer>>
}

export const walletPolicyAtomDefinition = {
  id: 'walletPolicyAtom',
  type: 'atom',
  factory: ({ storage }: Params) => {
    const createStorageAtom = createStorageAtomFactory<Record<string, Buffer>>({ storage })
    return createStorageAtom({
      key: 'walletPolicy',
      defaultValue: {},
    })
  },
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition
