import { mapValues } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'
import type { StorageAdapters, Wallet } from '../types.js'

// headless aborts a migration after 5s, so leave room for the write
const DETECT_TIMEOUT = 4000

// set when the repair lands, for a client that must reload to re-derive addresses in-session
export const DERIVATION_REPAIR_FLAG = 'pendingDerivationRepairReload'

const createPreferExodusDerivationMigration = async ({ adapters, modules }: MigrationParams) => {
  const { wallet, keychain, walletCompatibilityModes } = modules
  const storage = adapters.storage.namespace('walletAccounts')
  const flagsStorage = adapters.unsafeStorage.namespace('walletAccounts')

  const walletAccounts = (await storage.get('walletAccounts')) as
    | Record<string, WalletAccountJSON>
    | undefined

  const compatibilityMode = walletAccounts?.[WalletAccount.DEFAULT_NAME]?.compatibilityMode

  if (
    typeof compatibilityMode !== 'string' ||
    !walletCompatibilityModes.supports(compatibilityMode)
  ) {
    return
  }

  const seedId = await wallet.getPrimarySeedId()
  const exodusIsActive = await Promise.race([
    walletCompatibilityModes.hasExodusHistory({ mode: compatibilityMode, keychain, seedId }),
    rejectAfter(DETECT_TIMEOUT),
  ])

  if (!exodusIsActive) return

  const repaired = mapValues(walletAccounts, (walletAccount) =>
    walletAccount.source === WalletAccount.EXODUS_SRC
      ? { ...walletAccount, compatibilityMode: undefined }
      : walletAccount
  )

  await storage.set('walletAccounts', repaired)
  // atoms are already built from the stale value, so only a reload re-derives this session
  await flagsStorage.set(DERIVATION_REPAIR_FLAG, true)
}

const preferExodusDerivationMigration = {
  name: 'prefer-exodus-derivation',
  factory: createPreferExodusDerivationMigration,
}

const rejectAfter = (timeout: number) =>
  new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error('hasExodusHistory timed out')), timeout)
  })

type MigrationParams = {
  adapters: StorageAdapters
  modules: {
    wallet: Wallet
    keychain: unknown
    walletCompatibilityModes: WalletCompatibilityModes
  }
}

type WalletCompatibilityModes = {
  supports: (mode: string) => boolean
  hasExodusHistory: (params: {
    mode: string
    keychain: unknown
    seedId: string
  }) => Promise<boolean>
}

type WalletAccountJSON = Record<string, string | number | boolean | undefined>

export default preferExodusDerivationMigration
