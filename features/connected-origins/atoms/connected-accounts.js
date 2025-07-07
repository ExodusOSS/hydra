import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

/**
 * This atom caches addresses of connected accounts so they can be used when eagerly connecting without a user interaction.
 * We cannot use address provider in that case because the wallet may not be unlocked. This atom however sits on top of
 * the unsafe storage.
 */
export default function createConnectedAccountsAtom({ storage }) {
  return dedupe(
    createStorageAtomFactory({ storage })({
      key: 'accounts',
      defaultValue: {},
      isSoleWriter: true,
    })
  )
}
