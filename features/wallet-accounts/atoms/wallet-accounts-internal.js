import { createStorageAtomFactory, dedupe, withSerialization } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import lodash from 'lodash'
import { WalletAccount } from '@exodus/models'

const { isEmpty } = lodash

export default function createWalletAccountsInternalAtom({
  storage,
  config = Object.create(null),
}) {
  const atomFactory = createStorageAtomFactory({ storage })

  const initialWalletAccounts = {
    [WalletAccount.DEFAULT_NAME]: {
      ...WalletAccount.DEFAULT,
      label: config.defaultLabel,
      color: config.defaultColor,
    },
  }

  const walletAccountsAtom = atomFactory({
    key: 'walletAccounts',
    defaultValue: initialWalletAccounts,
    isSoleWriter: true,
  })

  const deserialize = (input) => {
    if (!input || isEmpty(input)) {
      console.warn(
        'WalletAccountAtom: Invalid atom value. Using default, but this should not happen.'
      )
      return initialWalletAccounts
    }

    const walletAccounts = mapValues(input, (data) => new WalletAccount(data))

    // Ensure that normal wallet accounts are sorted before hardware wallet accounts
    const sortedWalletAccounts = Object.entries(walletAccounts).sort(([, a], [, b]) => {
      return a.isHardware - b.isHardware
    })

    return Object.fromEntries(sortedWalletAccounts)
  }

  const serialize = (input) => {
    if (!input || isEmpty(input)) {
      // support `atom.set(undefined)` for clearing storage
      return
    }

    return mapValues(input, (data) => data.toJSON())
  }

  return dedupe(withSerialization({ atom: walletAccountsAtom, serialize, deserialize }))
}
