import type * as AtomsType from '@exodus/atoms'

const actualAtoms = await import('@exodus/atoms')

jest.doMock('@exodus/atoms', () => ({
  __esModule: true,
  ...actualAtoms,
  createAtomObserver: jest.fn(),
}))

const atoms = (await import('@exodus/atoms')) as unknown as typeof AtomsType & {
  createAtomObserver: jest.Mock
}
const { default: createPlugin } = await import('../lifecycle.js')

type Plugin = ReturnType<typeof createPlugin>
type PluginParams = Parameters<typeof createPlugin>[0]

describe('analyticsLifecyclePlugin', () => {
  let port: PluginParams['port']
  let shareActivityAtom: PluginParams['shareActivityAtom']
  let analyticsUserIdAtom: PluginParams['analyticsUserIdAtom']
  let analyticsAnonymousIdAtom: PluginParams['analyticsAnonymousIdAtom']
  let plugin: Plugin
  let shareActivityAtomObserver: { register: jest.Mock; unregister: jest.Mock; start: jest.Mock }
  let analytics: {
    setUserId: jest.Mock
    flush: jest.Mock
  }

  const userId = 'b'

  beforeEach(() => {
    analytics = {
      setUserId: jest.fn(),
      flush: jest.fn(),
    }

    shareActivityAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    atoms.createAtomObserver.mockReturnValue(shareActivityAtomObserver)

    port = { emit: jest.fn() } as unknown as PluginParams['port']
    shareActivityAtom = atoms.createInMemoryAtom({
      defaultValue: true,
    }) as unknown as PluginParams['shareActivityAtom']

    analyticsUserIdAtom = atoms.createInMemoryAtom({
      defaultValue: userId,
    }) as PluginParams['analyticsUserIdAtom']

    analyticsAnonymousIdAtom =
      atoms.createInMemoryAtom<string>() as PluginParams['analyticsAnonymousIdAtom']

    plugin = createPlugin({
      port,
      analytics: analytics as unknown as PluginParams['analytics'],
      shareActivityAtom,
      analyticsUserIdAtom,
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
    expect(analytics.setUserId).toHaveBeenCalledWith(userId)
  })

  it('flushes analytics on unlock after the user id is applied', async () => {
    plugin.onUnlock()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(analytics.flush).toHaveBeenCalledTimes(1)
    expect(analytics.setUserId.mock.invocationCallOrder[0]).toBeLessThan(
      analytics.flush.mock.invocationCallOrder[0]!
    )
  })

  it('does not flush analytics on load', async () => {
    plugin.onLoad({ isLocked: false })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(analytics.flush).not.toHaveBeenCalled()
  })
})
