import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'
import type { LockHistoryEntry, Wallet } from '../utils/types.js'
import type { Application } from '../modules/application.js'

const createApplicationReport = ({
  walletCreatedAtAtom,
  application,
  lockHistoryAtom,
}: {
  wallet: Wallet
  walletCreatedAtAtom: Atom<string>
  application: Application
  lockHistoryAtom: Atom<LockHistoryEntry[]>
}) => ({
  namespace: 'application',
  export: async ({ isLocked, walletExists } = Object.create(null)) => {
    const [isRestoring, isBackedUp, lockHistory] = await Promise.all([
      application.isRestoring(),
      application.isBackedUp(),
      lockHistoryAtom.get(),
    ])
    const serializedLockHistory = lockHistory.map((lockHistoryEntry) => ({
      ...lockHistoryEntry,
      timestamp: lockHistoryEntry.timestamp.toISOString(),
    }))

    if (isLocked) {
      return {
        isLocked,
        isRestoring,
        isBackedUp,
        lockHistory: serializedLockHistory,
      }
    }

    const getCreatedAt = async () => {
      if (!walletExists) {
        return null
      }

      // We have a theory that this might take a while to fetch, so we add a timeout.
      // Consider removing this if we don't see any placeholder errors below in Safe Reports.
      const timeout = new Promise((resolve) =>
        setTimeout(() => {
          resolve('Cannot fetch wallet created at.')
        }, 5000)
      )
      return Promise.race([walletCreatedAtAtom.get(), timeout])
    }

    return {
      isLocked,
      createdAt: await getCreatedAt(),
      isRestoring,
      isBackedUp,
      lockHistory: serializedLockHistory,
    }
  },
  getSchema: memoize(() =>
    z
      .object({
        isLocked: z.boolean(),
        createdAt: z.string().nullable(),
        isRestoring: z.boolean(),
        isBackedUp: z.boolean(),
        lockHistory: z.array(
          z
            .object({
              locked: z.boolean(),
              timestamp: z.string(),
            })
            .strict()
        ),
      })
      .strict()
      .partial()
  ),
})

const applicationReportDefinition = {
  id: 'applicationReport',
  type: 'report',
  factory: createApplicationReport,
  dependencies: ['walletCreatedAtAtom', 'application', 'lockHistoryAtom'],
} as const satisfies Definition

export default applicationReportDefinition
