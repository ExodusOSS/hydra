import type { Definition } from '@exodus/dependency-types'
import type { ReadonlyAtom } from '@exodus/atoms'

import { mapValues, memoize } from '@exodus/basic-utils'
import { z } from '@exodus/zod'
import type { WalletAccountsAtom } from '../types.js'

const createWalletAccountsReport = ({
  walletAccountsAtom,
  activeWalletAccountAtom,
  multipleWalletAccountsEnabledAtom,
}: Dependencies) => ({
  namespace: 'walletAccounts',
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

    const [walletAccounts, configuredActiveWalletAccount, multipleWalletAccountsEnabled] =
      await Promise.all([
        walletAccountsAtom.get(),
        activeWalletAccountAtom.get(),
        multipleWalletAccountsEnabledAtom.get(),
      ])

    const redactedData = mapValues(walletAccounts, (w) => w.toRedactedJSON())

    return {
      data: redactedData,
      configuredActiveWalletAccount,
      multipleWalletAccountsEnabled,
    }
  },
  getSchema: memoize(() => {
    // { [walletAccount]: { index: 0, source: 'exodus', enabled: true } }
    const redactedWalletAccountSchema = z.record(
      z.string(),
      z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional()
    )

    return z
      .object({
        data: redactedWalletAccountSchema,
        configuredActiveWalletAccount: z.string().nullable(),
        multipleWalletAccountsEnabled: z.boolean().optional(),
      })
      .strict()
      .nullable()
  }),
})

const walletAccountsReportDefinition = {
  id: 'walletAccountsReport',
  type: 'report',
  factory: createWalletAccountsReport,
  dependencies: [
    'walletAccountsAtom',
    'activeWalletAccountAtom',
    'multipleWalletAccountsEnabledAtom',
  ],
  public: true,
} as const satisfies Definition

type Dependencies = {
  walletAccountsAtom: WalletAccountsAtom
  activeWalletAccountAtom: ReadonlyAtom<string>
  multipleWalletAccountsEnabledAtom: ReadonlyAtom<boolean | undefined>
}

export default walletAccountsReportDefinition
