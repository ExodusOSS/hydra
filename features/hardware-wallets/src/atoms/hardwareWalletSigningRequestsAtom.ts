import { createInMemoryAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { SigningRequestState } from '../module/interfaces.js'

export const hardwareWalletSigningRequestsAtomDefinition = {
  id: 'hardwareWalletSigningRequestsAtom',
  type: 'atom',
  factory: () =>
    createInMemoryAtom<SigningRequestState>({
      defaultValue: Object.create(null) as SigningRequestState,
    }),
  dependencies: [],
  public: false,
} as const satisfies Definition
