import { createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import { WalletAccount } from '@exodus/models'

const createActiveWalletAccountAtom = ({ storage }: { storage: Storage<string> }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'activeWalletAccount',
    defaultValue: WalletAccount.DEFAULT_NAME,
    isSoleWriter: true,
  })
}

export default createActiveWalletAccountAtom
