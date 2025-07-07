import { waitUntil } from '@exodus/atoms'

import getSeedDerivedId from './get-seed-derived-id.js'
import createUserIdEnhance from './user-id-enhance.js'

const enhance = createUserIdEnhance('userId')

const noop = () => null

const createAnalyticsUserIdAtom = ({
  storage,
  keychain,
  lockedAtom,
  primarySeedIdAtom,
  logger,
  config: { keyIdentifier },
}) => {
  const get = async () => {
    await waitUntil({ atom: lockedAtom, predicate: (v) => v === false })
    return getSeedDerivedId({
      keychain,
      identifier: keyIdentifier,
      seedId: await primarySeedIdAtom.get(),
    })
  }

  const observe = (callback) => {
    let observing = true
    get().then((value) => observing && callback(value))
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
}

export default analyticsUserIdAtomDefinition
