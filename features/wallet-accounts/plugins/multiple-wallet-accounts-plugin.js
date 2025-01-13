const createMultipleWalletAccountsAutoEnable = ({
  walletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
}) => {
  let unsubscribe

  const onUnlock = () => {
    unsubscribe = walletAccountsAtom.observe(async (walletAccounts) => {
      const multipleWalletAccountsEnabled = await multipleWalletAccountsEnabledAtom.get()

      if (typeof multipleWalletAccountsEnabled === 'boolean') {
        unsubscribe()
        return
      }

      const enabledWalletAccountsLength = Object.keys(walletAccounts).filter(
        (key) => walletAccounts[key].enabled
      ).length

      if (enabledWalletAccountsLength > 1) {
        unsubscribe()
        await multipleWalletAccountsEnabledAtom.set(true)
      }
    })
  }

  const onLock = () => {
    if (unsubscribe) unsubscribe()
  }

  return { onLock, onUnlock }
}

export default createMultipleWalletAccountsAutoEnable
