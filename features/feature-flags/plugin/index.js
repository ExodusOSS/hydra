import { createAtomObserver } from '@exodus/atoms'

const createFeatureFlagsLifecyclePlugin = ({ featureFlags, port, featureFlagsAtom }) => {
  const featureFlagsAtomObserver = createAtomObserver({
    port,
    atom: featureFlagsAtom,
    event: 'featureFlags',
  })
  featureFlagsAtomObserver.register()

  const onStart = () => {
    featureFlags.load()
  }

  const onLoad = async () => {
    featureFlagsAtomObserver.start()
  }

  const onClear = async () => {
    await featureFlags.clear()
  }

  const onStop = () => {
    featureFlagsAtomObserver.unregister()
    featureFlags.stop()
  }

  return { onStart, onLoad, onClear, onStop }
}

const featureFlagsLifecyclePluginDefinition = {
  id: 'featureFlagsLifecyclePlugin',
  type: 'plugin',
  factory: createFeatureFlagsLifecyclePlugin,
  dependencies: ['featureFlags', 'port', 'featureFlagsAtom'],
  public: true,
}

export default featureFlagsLifecyclePluginDefinition
