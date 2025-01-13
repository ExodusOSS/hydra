import createLockHistoryAtom from '../lock-history.js'
import createdLockedAtom from '../locked.js'
import type { Atom } from '@exodus/atoms'

const delay = async () => new Promise(setImmediate)

describe('lockHistoryAtom', () => {
  let lockedAtom: Atom<boolean>
  let lockHistoryAtom: Atom<any>

  beforeEach(async () => {
    lockedAtom = createdLockedAtom()
    lockHistoryAtom = createLockHistoryAtom({ lockedAtom })
  })

  it('should add entry when locked', async () => {
    await lockedAtom.set(true)
    await lockedAtom.set(false)

    await expect(lockHistoryAtom.get()).resolves.toEqual([
      { locked: false, timestamp: expect.any(Date) },
      { locked: true, timestamp: expect.any(Date) },
    ])
  })

  it('should not add repeated entries when unchanged', async () => {
    await lockedAtom.set(true)
    await delay()
    await lockedAtom.set(true)
    await delay()

    await expect(lockHistoryAtom.get()).resolves.toEqual([
      { locked: true, timestamp: expect.any(Date) },
    ])
  })

  it('should not add more than 10 maxEntries', async () => {
    lockHistoryAtom = createLockHistoryAtom({ lockedAtom })

    for (let i = 0; i <= 11; i++) {
      await lockedAtom.set(i % 2 === 0)
      await delay()
    }

    await expect(lockHistoryAtom.get()).resolves.toHaveLength(10)
  })
})
