import { createAtomObserver } from '@exodus/atoms'

const createEnabledAssetsLifecyclePlugin = ({ port, enabledAssets, enabledAssetsAtom }) => {
  const enabledAssetsAtomObserver = createAtomObserver({
    port,
    atom: enabledAssetsAtom,
    event: 'enabledAssets',
  })

  const onLoad = ({ isLocked }) => {
    enabledAssetsAtomObserver.start()
    if (isLocked) return

    enabledAssets.load()
  }

  const onUnlock = async () => {
    enabledAssets.load()
  }

  const onClear = async () => {
    await enabledAssets.clear()
  }

  const onStop = () => {
    enabledAssetsAtomObserver.unregister()
  }

  return { onLoad, onUnlock, onClear, onStop }
}

const enabledAssetsPluginDefinition = {
  id: 'enabledAssetsLifecyclePlugin',
  type: 'plugin',
  factory: createEnabledAssetsLifecyclePlugin,
  dependencies: ['port', 'enabledAssets', 'enabledAssetsAtom'],
  public: true,
}

export default enabledAssetsPluginDefinition
