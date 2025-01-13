import { createAtomObserver } from '@exodus/atoms'

const createBalancesLifecyclePlugin = ({ balancesAtom, port, balances, hasBalanceAtom }) => {
  const balancesAtomObserver = createAtomObserver({
    port,
    atom: balancesAtom,
    event: 'balances',
  })

  const hasBalanceAtomObserver = createAtomObserver({
    port,
    atom: hasBalanceAtom,
    event: 'hasBalance',
  })

  const onLoad = () => {
    hasBalanceAtomObserver.start()
    balancesAtomObserver.start()

    balances.load()
  }

  const onStop = () => {
    balancesAtomObserver.unregister()
    hasBalanceAtomObserver.unregister()
    balances.stop()
  }

  const onClear = async () => {
    await hasBalanceAtom.set(undefined)
  }

  return {
    onLoad,
    onStop,
    onClear,
  }
}

export default createBalancesLifecyclePlugin
