import { mapValues } from '@exodus/basic-utils'
import { WalletAccount, type WalletAccountParams } from '@exodus/models'
import type { StorageAdapters, Wallet } from '../types.js'

const createMultiSeedWalletAccountsMigration = async ({ adapters, modules }: MigrationParams) => {
  const { wallet } = modules

  const primarySeedId = await wallet.getPrimarySeedId()
  const storage = adapters.storage.namespace('walletAccounts')
  const flagsStorage = adapters.unsafeStorage.namespace('flags')
  const compatibilityMode = (await flagsStorage.get('compatibilityMode')) as string | undefined

  const walletAccounts = (await storage.get('walletAccounts')) as
    | Record<string, WalletAccountJSON>
    | undefined

  const onFinish = async () => {
    await flagsStorage.delete('compatibilityMode')
  }

  if (!walletAccounts) {
    await onFinish()
    return
  }

  const migrated = mapValues(walletAccounts, (walletAccount) => {
    if (walletAccount.source === WalletAccount.EXODUS_SRC) {
      return new WalletAccount({
        ...walletAccount,
        seedId: primarySeedId,
        compatibilityMode,
      } as WalletAccountParams).toJSON()
    }

    return walletAccount
  })

  await storage.set('walletAccounts', migrated)
  await onFinish()
}

const multiSeedMigration = {
  name: 'multi-seed-wallet-accounts',
  factory: createMultiSeedWalletAccountsMigration,
}

type MigrationParams = {
  adapters: StorageAdapters
  modules: { wallet: Wallet }
}

type WalletAccountJSON = Record<string, string | number | boolean | undefined>

export default multiSeedMigration
