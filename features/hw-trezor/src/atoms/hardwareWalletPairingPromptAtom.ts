import { createInMemoryAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

export const hardwareWalletPairingPromptAtomDefinition = {
  id: 'hardwareWalletPairingPromptAtom',
  type: 'atom',
  factory: () =>
    createInMemoryAtom<boolean>({
      defaultValue: false,
    }),
  public: true,
} as const satisfies Definition
