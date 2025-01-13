import { createAtomObserver } from '@exodus/atoms'

const createAvailableAssetsPlugin = ({ port, availableAssetNamesAtom, availableAssets }) => {
  const observers = [
    createAtomObserver({
      port,
      atom: availableAssetNamesAtom,
      event: 'availableAssetNames',
    }),
  ]

  const onStart = () => {
    availableAssets.start()
  }

  const onLoad = () => {
    observers.forEach((observer) => observer.start())
  }

  const onStop = () => {
    observers.forEach((observer) => observer.unregister())
    availableAssets.stop()
  }

  return {
    onStart,
    onLoad,
    onStop,
  }
}

const availableAssetsPluginDefinition = {
  id: 'availableAssetsPlugin',
  type: 'plugin',
  factory: createAvailableAssetsPlugin,
  dependencies: ['port', 'availableAssetNamesAtom', 'availableAssets'],
  public: true,
}

export default availableAssetsPluginDefinition
