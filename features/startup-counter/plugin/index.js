import { createAtomObserver } from '@exodus/atoms'

const createStartupCountPlugin = ({ port, walletStartupCountAtom }) => {
  const observer = createAtomObserver({
    port,
    atom: walletStartupCountAtom,
    event: 'startupCount',
  })

  const onLoad = () => {
    observer.start()
  }

  const onUnlock = async () => {
    walletStartupCountAtom.set((startupCount) => startupCount + 1)
  }

  const onStop = () => {
    observer.unregister()
  }

  const onClear = async () => {
    await walletStartupCountAtom.set(undefined)
  }

  return { onLoad, onUnlock, onClear, onStop }
}

const startupCounterPluginDefinition = {
  id: 'startupCounterPlugin',
  type: 'plugin',
  factory: createStartupCountPlugin,
  dependencies: ['port', 'walletStartupCountAtom'],
  public: true,
}

export default startupCounterPluginDefinition
