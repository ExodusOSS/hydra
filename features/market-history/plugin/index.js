import { createAtomObserver } from '@exodus/atoms'

const createMarketHistoryLifecyclePlugin = ({
  marketHistoryMonitor,
  marketHistoryAtom,
  appProcessAtom,
  port,
}) => {
  let unobserve

  const observer = createAtomObserver({ port, atom: marketHistoryAtom, event: 'marketHistory' })

  const onStart = () => {
    if (!appProcessAtom) return

    let previousMode

    unobserve = appProcessAtom.observe(({ mode }) => {
      const isBackFromBackground = previousMode === 'background' && mode === 'active'
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
    marketHistoryMonitor.start()
  }

  const onStop = () => {
    observer.unregister()
    unobserve?.()
  }

  return { onStart, onUnlock, onLoad, onStop }
}

const marketHistoryLifecyclePluginDefinition = {
  id: 'marketHistoryLifecyclePlugin',
  type: 'plugin',
  factory: createMarketHistoryLifecyclePlugin,
  dependencies: ['marketHistoryMonitor', 'marketHistoryAtom', 'appProcessAtom?', 'port'],
  public: true,
}

export default marketHistoryLifecyclePluginDefinition
