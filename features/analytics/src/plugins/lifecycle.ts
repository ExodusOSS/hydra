import { randomUUID } from '@exodus/crypto/randomUUID'
import { createAtomObserver } from '@exodus/atoms'
import type { Atom, Port } from '@exodus/atoms'

import type { Analytics } from '../module/index.js'

type Params = {
  analytics: Pick<Analytics, 'linkUserIds' | 'setAnonymousId' | 'setUserId' | 'flush'>
  shareActivityAtom: Atom<boolean | undefined>
  analyticsUserIdAtom: Atom<string>
  analyticsAnonymousIdAtom: Atom<string | undefined>
  port: Port<boolean | undefined>
}

const createAnalyticsLifecyclePlugin = ({
  analytics,
  shareActivityAtom,
  analyticsUserIdAtom,
  analyticsAnonymousIdAtom,
  port,
}: Params) => {
  const shareActivityAtomObserver = createAtomObserver({
    port,
    atom: shareActivityAtom,
    event: 'shareActivity',
  })

  const setPermanentUserId = async (): Promise<void> => {
    const [userId, anonymousId] = await Promise.all([
      analyticsUserIdAtom.get(),
      analyticsAnonymousIdAtom.get(),
    ])

    if (anonymousId === undefined) return

    await analytics.linkUserIds({ userId, anonymousId })
  }

  const onStart = async (): Promise<void> => {
    let anonymousId = await analyticsAnonymousIdAtom.get()

    if (!anonymousId) {
      anonymousId = randomUUID()
      await analyticsAnonymousIdAtom.set(anonymousId)
    }

    analytics.setAnonymousId(anonymousId)
  }

  const identifyThenFlush = async (): Promise<void> => {
    analytics.setUserId(await analyticsUserIdAtom.get())

    // load-bearing: flush() alone unpauses tracking and drains the persisted backlog,
    // and it must run after setUserId so queued events keep their attribution
    await analytics.flush()
  }

  const onLoad = ({ isLocked }: { isLocked: boolean }): void => {
    if (isLocked) return

    shareActivityAtomObserver.start()
  }

  const onCreate = (): void => {
    void setPermanentUserId()
  }

  const onImport = (): void => {
    void setPermanentUserId()
  }

  const onUnlock = (): void => {
    shareActivityAtomObserver.start()

    void identifyThenFlush()
  }

  const onStop = (): void => {
    shareActivityAtomObserver.unregister()
  }

  const onClear = async (): Promise<void> => {
    await Promise.all([analyticsUserIdAtom.reset(), analyticsAnonymousIdAtom.reset()])
  }

  return { onStart, onLoad, onCreate, onImport, onUnlock, onStop, onClear }
}

export default createAnalyticsLifecyclePlugin
