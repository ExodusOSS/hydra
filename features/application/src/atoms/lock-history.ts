import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom, difference } from '@exodus/atoms'
import type { LockHistoryEntry } from '../utils/types.js'

type Params = {
  lockedAtom: Atom<boolean>
}

const MAX_ENTRIES = 10

const createLockHistoryAtom = ({ lockedAtom }: Params) => {
  const lockHistory = createInMemoryAtom<LockHistoryEntry[]>({
    defaultValue: [],
  })

  difference(lockedAtom).observe(async ({ current: locked }) => {
    await lockHistory.set((current) =>
      [{ locked, timestamp: new Date() }, ...current].slice(0, MAX_ENTRIES)
    )
  })

  return lockHistory
}

export default createLockHistoryAtom
