import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'

import applicationReportDefinition from '../index.js'
import type { Application } from '../modules/application.js'
import type { LockHistoryEntry, Wallet } from '../utils/types.js'

describe('applicationReport', () => {
  const application: Application = {
    isRestoring: async () => false,
    isBackedUp: async () => true,
  }
  const wallet: Wallet = {
    exists: async () => true,
    isLocked: async () => true,
  }
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

    const result = report.getSchema().parse(await report.export({ isLocked: false }))

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

    const result = report.getSchema().parse(await report.export({ isLocked: true }))

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
})
