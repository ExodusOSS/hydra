import { createStorageAtomFactory } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

const createActiveWalletAccountAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'activeWalletAccount',
    defaultValue: WalletAccount.DEFAULT_NAME,
    isSoleWriter: true,
  })
}

export default createActiveWalletAccountAtom
