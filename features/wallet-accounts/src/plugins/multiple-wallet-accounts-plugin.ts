import type { Unsubscribe } from '@exodus/atoms'
import { restrictConcurrency } from '@exodus/basic-utils'
import type { WalletAccountsAtom, MultipleWalletAccountsEnabledAtom } from '../types.js'

const createMultipleWalletAccountsAutoEnable = ({
  walletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
}: {
  walletAccountsAtom: WalletAccountsAtom
  multipleWalletAccountsEnabledAtom: MultipleWalletAccountsEnabledAtom
}) => {
  let active = false
  let lifecycleVersion = 0
  let unsubscribe: Unsubscribe | undefined

  const stopObserving = () => {
    unsubscribe?.()
    unsubscribe = undefined
  }

  const isCurrentLifecycle = (version: number) => active && version === lifecycleVersion

  const evaluate = restrictConcurrency(async (version: number) => {
    if (!isCurrentLifecycle(version)) return

    const multipleWalletAccountsEnabled = await multipleWalletAccountsEnabledAtom.get()
    if (!isCurrentLifecycle(version)) return

    if (typeof multipleWalletAccountsEnabled === 'boolean') {
      stopObserving()
      return
    }

    const walletAccounts = await walletAccountsAtom.get()
    if (!isCurrentLifecycle(version)) return

    const enabledNonExternalWalletAccountsLength = Object.values(walletAccounts).filter(
      (walletAccount) => walletAccount.enabled && !walletAccount.isExternal
    ).length

    if (enabledNonExternalWalletAccountsLength > 1) {
      stopObserving()
      await multipleWalletAccountsEnabledAtom.set((current) => {
        if (!isCurrentLifecycle(version)) return current
        return typeof current === 'boolean' ? current : true
      })
    }
  })

  const onUnlock = () => {
    active = true
    lifecycleVersion += 1
    stopObserving()
    const version = lifecycleVersion
    const scheduleEvaluation = () => {
      void evaluate(version)
    }

    unsubscribe = walletAccountsAtom.observe(scheduleEvaluation)
    scheduleEvaluation()
  }

  const onLock = () => {
    active = false
    lifecycleVersion += 1
    stopObserving()
  }

  return { onLock, onUnlock }
}

export default createMultipleWalletAccountsAutoEnable
