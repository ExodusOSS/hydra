import { createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import { createEmptyAccounts } from '../module/utils.js'
import type { HardwareWalletPublicKeys } from '../types.js'

export default function createHardwareWalletPublicKeysAtom({
  storage,
}: {
  storage: Storage<HardwareWalletPublicKeys>
}) {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'hardwareWalletPublicKeys',
    defaultValue: createEmptyAccounts() as HardwareWalletPublicKeys,
    isSoleWriter: true,
  })
}
