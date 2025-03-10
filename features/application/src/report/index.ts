import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'
import type { Wallet } from '../utils/types.js'
import type { Application } from '../modules/application.js'

const createApplicationReport = ({
  wallet,
  walletCreatedAtAtom,
  application,
}: {
  wallet: Wallet
  walletCreatedAtAtom: Atom<Date>
  application: Application
}) => ({
  namespace: 'application',
  export: async () => {
    const getCreatedAt = async () => ((await wallet.exists()) ? walletCreatedAtAtom.get() : null)
    const [createdAt, isLocked, isRestoring, isBackedUp] = await Promise.all([
      getCreatedAt(),
      wallet.isLocked(),
      application.isRestoring(),
      application.isBackedUp(),
    ])

    return {
      isLocked,
      createdAt,
      isRestoring,
      isBackedUp,
    }
  },
})

const applicationReportDefinition = {
  id: 'applicationReport',
  type: 'report',
  factory: createApplicationReport,
  dependencies: ['wallet', 'walletCreatedAtAtom', 'application'],
} as const satisfies Definition

export default applicationReportDefinition
