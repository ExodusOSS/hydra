import { createInMemoryAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

export function createSoftwareWalletPublicKeysAtom() {
  return createInMemoryAtom({ defaultValue: Object.create(null) })
}

const softwareWalletPublicKeysAtomDefinition = {
  id: 'softwareWalletPublicKeysAtom',
  type: 'atom',
  factory: createSoftwareWalletPublicKeysAtom,
} as const satisfies Definition

export default softwareWalletPublicKeysAtomDefinition
