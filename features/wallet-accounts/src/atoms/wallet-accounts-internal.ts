import { createStorageAtomFactory, dedupe, withSerialization } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import { mapValues } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { WalletAccount } from '@exodus/models'
import type { WalletAccountParams } from '@exodus/models/lib/wallet-account/index.js'

const { isEmpty } = lodash

export type SerializedWalletAccounts = Record<string, Record<string, unknown>> | undefined

export default function createWalletAccountsInternalAtom({
  storage,
}: {
  storage: Storage<SerializedWalletAccounts>
}) {
  const atomFactory = createStorageAtomFactory({ storage })

  const walletAccountsAtom = atomFactory({
    key: 'walletAccounts',
    isSoleWriter: true,
  })

  const deserialize = (input: SerializedWalletAccounts) => {
    if (!input || isEmpty(input)) {
      return
    }

    const walletAccounts = mapValues(
      input,
      (data) => new WalletAccount(data as WalletAccountParams)
    )

    // Ensure that normal wallet accounts are sorted before hardware wallet accounts
    const sortedWalletAccounts = Object.entries(walletAccounts).sort(([, a], [, b]) => {
      return Number(a.isHardware) - Number(b.isHardware)
    })

    return Object.fromEntries(sortedWalletAccounts)
  }

  const serialize = (input: Record<string, WalletAccount> | undefined) => {
    if (!input || isEmpty(input)) {
      // support `atom.set(undefined)` for clearing storage
      return
    }

    return mapValues(input, (data) => data.toJSON())
  }

  return dedupe(
    withSerialization({
      atom: walletAccountsAtom as Atom<SerializedWalletAccounts>,
      serialize,
      deserialize,
    })
  )
}
