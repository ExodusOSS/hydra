import { randomUUID } from '@exodus/crypto/randomUUID'
import { createAtomObserver } from '@exodus/atoms'

const createAnalyticsLifecyclePlugin = ({
  analytics,
  shareActivityAtom,
  analyticsUserIdAtom,
  analyticsAnonymousIdAtom,
  analyticsExtraSeedsUserIdsAtom,
  port,
}) => {
  const shareActivityAtomObserver = createAtomObserver({
    port,
    atom: shareActivityAtom,
    event: 'shareActivity',
  })

  let extraSeedsUserIdsUnobserve
  const setPermanentUserId = async () => {
    const [userId, anonymousId] = await Promise.all([
      analyticsUserIdAtom.get(),
      analyticsAnonymousIdAtom.get(),
    ])

    await analytics.linkUserIds({ userId, anonymousId })
  }

  const onStart = async () => {
    let anonymousId = await analyticsAnonymousIdAtom.get()

    if (!anonymousId) {
      anonymousId = randomUUID()
      await analyticsAnonymousIdAtom.set(anonymousId)
    }

    analytics.setAnonymousId(anonymousId)
  }

  const onLoad = ({ isLocked }) => {
    if (isLocked) return

    shareActivityAtomObserver.start()
  }

  const onCreate = () => {
    setPermanentUserId()
  }

  const onImport = () => {
    setPermanentUserId()
  }

  const onUnlock = () => {
    shareActivityAtomObserver.start()

    analyticsUserIdAtom.get().then(async (userId) => {
      analytics.setUserId(userId)
    })

    extraSeedsUserIdsUnobserve = analyticsExtraSeedsUserIdsAtom.observe((extraSeedUserIds) => {
      const extraSeedIds = Object.values(extraSeedUserIds)
      extraSeedIds.sort()

      analytics.setExtraUserIds(extraSeedIds)
      analytics.flush()
    })
  }

  const onStop = () => {
    shareActivityAtomObserver.unregister()
    extraSeedsUserIdsUnobserve?.()
  }

  const onClear = async () => {
    await Promise.all([analyticsUserIdAtom.reset(), analyticsAnonymousIdAtom.reset()])
  }

  return { onStart, onLoad, onCreate, onImport, onUnlock, onStop, onClear }
}

export default createAnalyticsLifecyclePlugin
