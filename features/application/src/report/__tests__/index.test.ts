import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'

import type { Application } from '../../modules/application.js'
import type { LockHistoryEntry, Wallet } from '../../utils/types.js'
import applicationReportDefinition from '../index.js'

describe('applicationReport', () => {
  const application = {
    isRestoring: async () => false,
    isBackedUp: async () => true,
  } as unknown as Application
  const wallet = {
    exists: async () => true,
    isLocked: async () => true,
  } as unknown as Wallet
  let walletCreatedAtAtom: Atom<string>
  let lockHistoryAtom: Atom<LockHistoryEntry[]>
  const createdAt = new Date().toISOString()
  const lockHistory: LockHistoryEntry[] = [
    { locked: true, timestamp: new Date('2023-01-01T12:00:00Z') },
    { locked: false, timestamp: new Date('2023-01-02T15:30:00Z') },
  ]

  beforeEach(() => {
    walletCreatedAtAtom = createInMemoryAtom({ defaultValue: createdAt })
    lockHistoryAtom = createInMemoryAtom({ defaultValue: lockHistory })
  })

  it('should provide the correct namespace', async () => {
    const report = applicationReportDefinition.factory({
      application,
      lockHistoryAtom,
      wallet,
      walletCreatedAtAtom,
    })

    expect(report.namespace).toEqual('application')
  })

  it('should export a report', async () => {
    const report = applicationReportDefinition.factory({
      application,
      lockHistoryAtom,
      wallet,
      walletCreatedAtAtom,
    })

    const result = report
      .getSchema()
      .parse(await report.export({ isLocked: false, walletExists: true }))

    expect(result).toEqual({
      isLocked: false,
      createdAt,
      isRestoring: await application.isRestoring(),
      isBackedUp: await application.isBackedUp(),
      lockHistory: lockHistory.map((lockHistoryEntry) => ({
        ...lockHistoryEntry,
        timestamp: lockHistoryEntry.timestamp.toISOString(),
      })),
    })
  })

  it('should handle gracefully when the wallet is locked', async () => {
    const report = applicationReportDefinition.factory({
      application,
      lockHistoryAtom,
      wallet,
      walletCreatedAtAtom,
    })

    const result = report
      .getSchema()
      .parse(await report.export({ isLocked: true, walletExists: true }))

    expect(result).toEqual({
      isLocked: true,
      isRestoring: await application.isRestoring(),
      isBackedUp: await application.isBackedUp(),
      lockHistory: lockHistory.map((lockHistoryEntry) => ({
        ...lockHistoryEntry,
        timestamp: lockHistoryEntry.timestamp.toISOString(),
      })),
    })
  })

  it('should handle gracefully when walletCreatedAtAtom is taking a while to fetch', async () => {
    jest.useFakeTimers()

    // No default value to force getting a value indefinitely stuck
    const walletCreatedAtAtom = createInMemoryAtom()
    const report = applicationReportDefinition.factory({
      application,
      lockHistoryAtom,
      wallet,
      // @ts-expect-error - intentionally broke up the atom above.
      walletCreatedAtAtom,
    })

    const exportPromise = report.export({ isLocked: false, walletExists: true })
    await jest.runAllTimersAsync()
    const result = report.getSchema().parse(await exportPromise)

    jest.useRealTimers()

    expect(result).toEqual({
      isLocked: false,
      createdAt: 'Cannot fetch wallet created at.',
      isRestoring: await application.isRestoring(),
      isBackedUp: await application.isBackedUp(),
      lockHistory: lockHistory.map((lockHistoryEntry) => ({
        ...lockHistoryEntry,
        timestamp: lockHistoryEntry.timestamp.toISOString(),
      })),
    })
  })
})
