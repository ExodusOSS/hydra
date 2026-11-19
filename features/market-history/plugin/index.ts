import { createAtomObserver } from '@exodus/atoms'

import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

import type { ErrorTracking, MarketHistoryPort, MarketHistoryState } from '../types.js'

type MarketHistoryMonitor = {
  start: () => Promise<void>
  stop: () => void
  hydrate: () => Promise<void>
}

type Dependencies = {
  marketHistoryMonitor: MarketHistoryMonitor
  marketHistoryAtom: Atom<MarketHistoryState | undefined>
  appProcessAtom?: ReadonlyAtom<{ mode: string }>
  port: MarketHistoryPort
  errorTracking: ErrorTracking
}

const createMarketHistoryLifecyclePlugin = ({
  marketHistoryMonitor,
  marketHistoryAtom,
  appProcessAtom,
  port,
  errorTracking,
}: Dependencies) => {
  let unobserve: (() => void) | undefined

  const observer = createAtomObserver({ port, atom: marketHistoryAtom, event: 'marketHistory' })

  const subscribeToAppProcessChanges = () => {
    if (!appProcessAtom) return

    let previousMode: string | undefined

    unobserve = appProcessAtom.observe(({ mode }: { mode: string }) => {
      const previousModeIsBackground = previousMode !== undefined && previousMode !== 'active'
      const isBackFromBackground = previousModeIsBackground && mode === 'active'
      const isGoingToBackground = previousMode !== 'background' && mode === 'background'

      if (isBackFromBackground) {
        void marketHistoryMonitor.start()
      }

      if (isGoingToBackground) {
        marketHistoryMonitor.stop()
      }

      previousMode = mode
    })
  }

  const onStart = () => {
    void observer.start()
    marketHistoryMonitor.hydrate().catch((e: unknown) => {
      errorTracking.track({ error: e, context: 'start' })
    })
  }

  const onUnlock = () => {
    const nonBlockingStart = async () => {
      try {
        await marketHistoryMonitor.start()
        subscribeToAppProcessChanges()
      } catch (e) {
        errorTracking.track({ error: e, context: 'unlock' })
        throw e
      }
    }

    void nonBlockingStart()
  }

  const onStop = () => {
    observer.unregister()
    unobserve?.()
    marketHistoryMonitor.stop()
  }

  return { onStart, onUnlock, onStop }
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
} as const satisfies Definition

export default marketHistoryLifecyclePluginDefinition
