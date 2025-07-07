jest.doMock('@exodus/atoms/factories/observer', () => ({ __esModule: true, default: jest.fn() }))

const atoms = await import('@exodus/atoms')
const { default: createPlugin } = await import('../lifecycle.js')

describe('analyticsLifecyclePlugin', () => {
  let port
  let shareActivityAtom
  let analyticsUserIdAtom
  let analyticsExtraSeedsUserIdsAtom
  let analyticsAnonymousIdAtom
  let plugin
  let shareActivityAtomObserver
  let analytics

  const userIds = ['b', 'a']
  const seedToUserIdMap = { seed1: 'b', seed2: 'a' }

  beforeEach(() => {
    analytics = {
      setUserId: jest.fn(),
      setExtraUserIds: jest.fn(),
      flush: jest.fn(),
    }

    shareActivityAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    atoms.createAtomObserver.mockReturnValue(shareActivityAtomObserver)

    port = { emit: jest.fn() }
    shareActivityAtom = atoms.createInMemoryAtom({
      defaultValue: {
        exists: true,
        // user data
      },
    })

    analyticsUserIdAtom = atoms.createInMemoryAtom({
      defaultValue: seedToUserIdMap.seed1,
    })

    analyticsExtraSeedsUserIdsAtom = atoms.createInMemoryAtom()
    analyticsAnonymousIdAtom = atoms.createInMemoryAtom()

    plugin = createPlugin({
      port,
      analytics,
      shareActivityAtom,
      analyticsUserIdAtom,
      analyticsExtraSeedsUserIdsAtom,
      analyticsAnonymousIdAtom,
    })
  })

  it('should start observing atoms when loaded and unlocked', () => {
    plugin.onLoad({ isLocked: false })

    expect(shareActivityAtomObserver.start).toHaveBeenCalled()
  })

  it('should do nothing when loaded, feature on and locked', async () => {
    const featurePromise = Promise.resolve({ isOn: true })

    plugin.onLoad({ isLocked: true })

    await featurePromise

    expect(shareActivityAtomObserver.start).not.toHaveBeenCalled()
  })

  it('should start observing atoms when unlocked', () => {
    plugin.onUnlock()

    expect(shareActivityAtomObserver.start).toHaveBeenCalled()
  })

  it('should unobserve atoms when stopped', () => {
    plugin.onStop()

    expect(shareActivityAtomObserver.unregister).toHaveBeenCalled()
  })

  it('sets analytics user id on unlock', async () => {
    plugin.onUnlock()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(analytics.setUserId).toHaveBeenCalledTimes(1)
    expect(analytics.setUserId).toHaveBeenCalledWith(seedToUserIdMap.seed1)
  })

  it('subscribe to extra user ids changes on unlock', async () => {
    plugin.onUnlock()
    await analyticsExtraSeedsUserIdsAtom.set(seedToUserIdMap)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(analytics.setExtraUserIds).toHaveBeenCalledTimes(1)
    expect(analytics.setExtraUserIds).toHaveBeenCalledWith(userIds.sort())
    expect(analytics.flush).toHaveBeenCalledTimes(1)
  })
})
