import { createStorageAtomFactory, dedupe, withSerialization } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import { mapValues } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { WalletAccount, type WalletAccountParams } from '@exodus/models'

const { isEmpty, isEqual } = lodash

export type SerializedWalletAccounts = Record<string, WalletAccountParams> | undefined

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

  let lastEntries: [string, WalletAccountParams][] | undefined
  let lastDeserialized: Record<string, WalletAccount> | undefined

  // atom.get() re-wraps the cached serialized map in a fresh freeze proxy on every call, so the
  // top-level reference is unstable; the nested per-account objects keep their identity until set()
  const isUnchanged = (input: NonNullable<SerializedWalletAccounts>) => {
    if (!lastEntries) return false

    const keys = Object.keys(input)
    if (keys.length !== lastEntries.length) return false

    return lastEntries.every(([key, value]) => isEqual(input[key], value))
  }

  const deserialize = (input: SerializedWalletAccounts) => {
    if (!input || isEmpty(input)) {
      lastEntries = undefined
      lastDeserialized = undefined
      return
    }

    if (isUnchanged(input)) {
      return lastDeserialized
    }

    const walletAccounts = mapValues(input, (data) => new WalletAccount(data))

    // Ensure that normal wallet accounts are sorted before hardware wallet accounts
    const sortedWalletAccounts = Object.entries(walletAccounts).sort(([, a], [, b]) => {
      return Number(a.isHardware) - Number(b.isHardware)
    })

    const deserialized: Record<string, WalletAccount> = Object.fromEntries(sortedWalletAccounts)
    // the same map is now shared by every reader; make stray mutations fail fast
    Object.freeze(deserialized)

    lastEntries = Object.entries(input)
    lastDeserialized = deserialized
    return lastDeserialized
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
