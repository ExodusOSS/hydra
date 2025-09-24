import { mapValues } from '@exodus/basic-utils'
import { EXODUS_SRC } from '@exodus/models/lib/wallet-account/index.js'
import { WalletAccount } from '@exodus/models'

const createMultiSeedWalletAccountsMigration = async ({ adapters, modules, config }) => {
  const { wallet } = modules

  const primarySeedId = await wallet.getPrimarySeedId()
  const storage = adapters.storage.namespace('walletAccounts')
  const flagsStorage = adapters.unsafeStorage.namespace('flags')
  const compatibilityMode = await flagsStorage.get('compatibilityMode')

  const walletAccounts = await storage.get('walletAccounts')

  const onFinish = async () => {
    await flagsStorage.delete('compatibilityMode')
  }

  if (!walletAccounts) {
    await onFinish()
    return
  }

  const migrated = mapValues(walletAccounts, (walletAccount) => {
    if (walletAccount.source === EXODUS_SRC) {
      return new WalletAccount({
        ...walletAccount,
        seedId: primarySeedId,
        compatibilityMode,
      }).toJSON()
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

export default multiSeedMigration
