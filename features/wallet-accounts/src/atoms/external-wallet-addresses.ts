import { createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import { createEmptyAccounts } from '../module/utils.js'
import type { ExternalWalletAddresses } from '../types.js'

export default function createExternalWalletAddressesAtom({
  storage,
}: {
  storage: Storage<ExternalWalletAddresses>
}) {
  const atomFactory = createStorageAtomFactory({ storage })
  return atomFactory({
    key: 'externalWalletAddresses',
    defaultValue: createEmptyAccounts() as ExternalWalletAddresses,
    isSoleWriter: true,
  })
}
