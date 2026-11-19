import { createAtomObserver } from '@exodus/atoms'

const createFeatureFlagsLifecyclePlugin = ({
  featureFlags,
  port,
  featureFlagsAtom,
  appProcessAtom,
  logger,
}) => {
  let unobserveAppProcess

  const featureFlagsAtomObserver = createAtomObserver({
    port,
    atom: featureFlagsAtom,
    event: 'featureFlags',
  })
  featureFlagsAtomObserver.register()

  const subscribeToAppProcessChanges = () => {
    if (!appProcessAtom) return

    let previousMode

    unobserveAppProcess = appProcessAtom.observe(({ mode }) => {
      const wasBackground = previousMode !== undefined && previousMode !== 'active'
      const isBackFromBackground = wasBackground && mode === 'active'

      if (isBackFromBackground) {
        void featureFlags.refresh().catch((error) => {
          logger?.error('Failed to refresh feature flags', error)
        })
      }

      previousMode = mode
    })
  }

  const onStart = () => {
    featureFlagsAtomObserver.start()
    featureFlags.load()
    subscribeToAppProcessChanges()
  }

  const onClear = async () => {
    await featureFlags.clear()
  }

  const onStop = () => {
    featureFlagsAtomObserver.unregister()
    unobserveAppProcess?.()
    featureFlags.stop()
  }

  return { onStart, onClear, onStop }
}

const featureFlagsLifecyclePluginDefinition = {
  id: 'featureFlagsLifecyclePlugin',
  type: 'plugin',
  factory: createFeatureFlagsLifecyclePlugin,
  dependencies: ['featureFlags', 'port', 'featureFlagsAtom', 'appProcessAtom?', 'logger?'],
  public: true,
}

export default featureFlagsLifecyclePluginDefinition
