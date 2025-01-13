import { createAtomObserver } from '@exodus/atoms'

const getHasSyncedBalance = (balances) =>
  Object.values(balances).some((accountBalance) =>
    Object.values(accountBalance).some((assetBalance) => !assetBalance.isZero)
  )
const getHasBalance = (balances) =>
  Object.values(balances).some((accountBalance) =>
    Object.values(accountBalance).some(
      (assetBalance) => assetBalance.total && !assetBalance.total.isZero
    )
  )

const createRestoreModalPlugin = ({
  port,
  shouldShowPostRestoredModalAtom,
  syncedBalancesAtom,
  balancesAtom,
  logger,
}) => {
  const shouldShowPostRestoredModalObserver = createAtomObserver({
    port,
    atom: shouldShowPostRestoredModalAtom,
    event: 'shouldShowPostRestoredModal',
  })

  const onLoad = () => {
    shouldShowPostRestoredModalObserver.start()
  }

  const onRestoreCompleted = async () => {
    const setModalRestored = async () => {
      if (syncedBalancesAtom) {
        const syncedBalances = await syncedBalancesAtom.get()
        const hasBalance = getHasSyncedBalance(syncedBalances)
        if (hasBalance) {
          await shouldShowPostRestoredModalAtom.set(true)
        }

        return
      }

      const { balances = {} } = await balancesAtom.get()
      const hasBalance = getHasBalance(balances)
      if (hasBalance) {
        await shouldShowPostRestoredModalAtom.set(true)
      }
    }

    setModalRestored().catch((e) => logger.warn('failed to set postRestoredModalAtom', e))
  }

  const onClear = () => shouldShowPostRestoredModalAtom.set(false)

  const onStop = () => {
    shouldShowPostRestoredModalObserver.unregister()
  }

  return { onLoad, onRestoreCompleted, onClear, onStop }
}

const postRestoreModalPluginDefinition = {
  id: 'postRestoreModalPlugin',
  type: 'plugin',
  factory: createRestoreModalPlugin,
  dependencies: [
    'port',
    'shouldShowPostRestoredModalAtom',
    'syncedBalancesAtom?',
    'balancesAtom',
    'logger',
  ],
  public: true,
}

export default postRestoreModalPluginDefinition
