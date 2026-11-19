import { waitUntil } from '@exodus/atoms'
import type { Atom, Listener, Logger } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type KeyIdentifier from '@exodus/key-identifier'
import type { Storage } from '@exodus/storage-interface'

import getSeedDerivedId from './get-seed-derived-id.js'
import createUserIdEnhance from './user-id-enhance.js'

type Keychain = {
  exportKey: (params: { seedId: string; keyId: KeyIdentifier }) => Promise<{ publicKey: string }>
}

type Params = {
  storage: Storage<string>
  keychain: Keychain
  lockedAtom: Atom<boolean>
  primarySeedIdAtom: Atom<string>
  logger: Logger
  config: { keyIdentifier: KeyIdentifier }
}

const enhance = createUserIdEnhance('userId')

const noop = async (): Promise<void> => {}

const createAnalyticsUserIdAtom = ({
  storage,
  keychain,
  lockedAtom,
  primarySeedIdAtom,
  logger,
  config: { keyIdentifier },
}: Params) => {
  const get = async (): Promise<string> => {
    await waitUntil({ atom: lockedAtom, predicate: (v) => v === false })
    return getSeedDerivedId({
      keychain,
      identifier: keyIdentifier,
      seedId: await primarySeedIdAtom.get(),
    })
  }

  const observe = (callback: Listener<string>) => {
    let observing = true
    void get().then((value) => observing && callback(value))
    return () => {
      observing = false
    }
  }

  return enhance({
    atom: { get, observe, set: noop, reset: noop },
    storage,
    logger,
  })
}

const analyticsUserIdAtomDefinition = {
  id: 'analyticsUserIdAtom',
  type: 'atom',
  factory: createAnalyticsUserIdAtom,
  dependencies: ['config', 'lockedAtom', 'primarySeedIdAtom', 'storage', 'keychain', 'logger'],
  public: true,
} as const satisfies Definition

export default analyticsUserIdAtomDefinition
