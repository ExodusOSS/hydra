import type { WalletAccount } from '@exodus/models'
import type { WalletAccountsAtom, MultipleWalletAccountsEnabledAtom } from '../types.js'

const createMultipleWalletAccountsAutoEnable = ({
  walletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
}: {
  walletAccountsAtom: WalletAccountsAtom
  multipleWalletAccountsEnabledAtom: MultipleWalletAccountsEnabledAtom
}) => {
  let unsubscribe: (() => void) | undefined

  const onUnlock = () => {
    unsubscribe = walletAccountsAtom.observe(
      async (walletAccounts: Record<string, WalletAccount>) => {
        const multipleWalletAccountsEnabled = await multipleWalletAccountsEnabledAtom.get()

        if (typeof multipleWalletAccountsEnabled === 'boolean') {
          unsubscribe!()
          return
        }

        const enabledWalletAccountsLength = Object.keys(walletAccounts).filter(
          (key) => walletAccounts[key]?.enabled
        ).length

        if (enabledWalletAccountsLength > 1) {
          unsubscribe!()
          await multipleWalletAccountsEnabledAtom.set(true)
        }
      }
    )
  }

  const onLock = () => {
    if (unsubscribe) unsubscribe()
  }

  return { onLock, onUnlock }
}

export default createMultipleWalletAccountsAutoEnable
