import { createAtomObserver } from '@exodus/atoms'

const createFiatBalancesPlugin = ({
  port,
  fiatBalancesAtom,
  optimisticFiatBalancesAtom,
  fiatBalances,
  optimisticFiatBalances,
}) => {
  const fiatBalancesAtomObserver = createAtomObserver({
    port,
    atom: fiatBalancesAtom,
    event: 'fiatBalances',
  })
  const optimisticFiatBalancesAtomObserver = optimisticFiatBalancesAtom
    ? createAtomObserver({
        port,
        atom: optimisticFiatBalancesAtom,
        event: 'optimisticFiatBalances',
      })
    : null
  fiatBalancesAtomObserver.register()
  optimisticFiatBalancesAtomObserver?.register()
  return {
    onStart: () => {
      fiatBalances.load()
      optimisticFiatBalances?.load()
    },
    onLoad: () => {
      fiatBalancesAtomObserver.start()
      optimisticFiatBalancesAtomObserver?.start()
    },
    onStop: () => {
      fiatBalancesAtomObserver.unregister()
      optimisticFiatBalancesAtomObserver?.unregister()
      fiatBalances.stop()
    },
  }
}

const fiatBalancesPluginDefinition = {
  id: 'fiatBalancesPlugin',
  type: 'plugin',
  factory: createFiatBalancesPlugin,
  dependencies: [
    'fiatBalances',
    'port',
    'fiatBalancesAtom',
    'optimisticFiatBalances?',
    'optimisticFiatBalancesAtom?',
  ],
  public: true,
}

export default fiatBalancesPluginDefinition
