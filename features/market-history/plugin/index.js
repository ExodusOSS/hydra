import { createAtomObserver } from '@exodus/atoms'

const createMarketHistoryLifecyclePlugin = ({
  marketHistoryMonitor,
  marketHistoryAtom,
  appProcessAtom,
  port,
  errorTracking,
}) => {
  let unobserve

  const observer = createAtomObserver({ port, atom: marketHistoryAtom, event: 'marketHistory' })

  const subscribeToAppProcessChanges = () => {
    if (!appProcessAtom) return

    let previousMode

    unobserve = appProcessAtom.observe(({ mode }) => {
      const previousModeIsBackground = previousMode !== undefined && previousMode !== 'active'
      const isBackFromBackground = previousModeIsBackground && mode === 'active'
      const isGoingToBackground = previousMode !== 'background' && mode === 'background'

      if (isBackFromBackground) {
        marketHistoryMonitor.start()
      }

      if (isGoingToBackground) {
        marketHistoryMonitor.stop()
      }

      previousMode = mode
    })
  }

  const onLoad = () => {
    observer.start()
  }

  const onUnlock = () => {
    const nonBlockingStart = async () => {
      try {
        await marketHistoryMonitor.start()
        subscribeToAppProcessChanges()
      } catch (e) {
        errorTracking.track({ error: e, namespace: 'marketHistory', context: 'unlock' })
        throw e
      }
    }

    nonBlockingStart()
  }

  const onStop = () => {
    observer.unregister()
    unobserve?.()
    marketHistoryMonitor.stop()
  }

  return { onUnlock, onLoad, onStop }
}

const marketHistoryLifecyclePluginDefinition = {
  id: 'marketHistoryLifecyclePlugin',
  type: 'plugin',
  factory: createMarketHistoryLifecyclePlugin,
  dependencies: [
    'marketHistoryMonitor',
    'marketHistoryAtom',
    'appProcessAtom?',
    'port',
    'errorTracking',
  ],
  public: true,
}

export default marketHistoryLifecyclePluginDefinition
