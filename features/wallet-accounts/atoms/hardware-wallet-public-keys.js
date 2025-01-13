import { createStorageAtomFactory } from '@exodus/atoms'
import { createEmptyAccounts } from '../module/utils.js'

export default function createHardwareWalletPublicKeysAtom({ storage }) {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'hardwareWalletPublicKeys',
    defaultValue: createEmptyAccounts(),
    isSoleWriter: true,
  })
}
