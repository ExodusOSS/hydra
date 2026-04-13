import { createStorageAtomFactory } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

export const hardwareWalletThpCredentialsAtomDefinition = {
  id: 'hardwareWalletThpCredentialsAtom',
  type: 'atom',
  factory: ({ storage }: { storage: any }) =>
    createStorageAtomFactory({ storage })({
      defaultValue: undefined,
      key: 'hardwareWalletThpCredentials',
    }),
  dependencies: ['storage'],
  public: false,
} as const satisfies Definition
