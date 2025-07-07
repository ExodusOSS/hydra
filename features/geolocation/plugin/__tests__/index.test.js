jest.doMock('@exodus/atoms/factories/observer', () => ({ __esModule: true, default: jest.fn() }))

const atoms = await import('@exodus/atoms')
const { default: geolocationLifecyclePluginDefinition } = await import('../index.js')

describe('geolocationLifecyclePlugin', () => {
  let port
  let geolocationAtom
  let geolocationMonitor
  let plugin
  let geolocationAtomObserver

  beforeEach(() => {
    geolocationAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    atoms.createAtomObserver.mockReturnValue(geolocationAtomObserver)

    port = { emit: jest.fn() }
    geolocationAtom = atoms.createInMemoryAtom({
      defaultValue: { ip: '123', isAllowed: true, other: 'more data' },
    })
    geolocationMonitor = { start: jest.fn(), stop: jest.fn() }
    plugin = geolocationLifecyclePluginDefinition.factory({
      port,
      geolocationMonitor,
      geolocationAtom,
    })
  })

  it('should create atom observers and register them but not start yet', () => {
    plugin.onStart()

    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: geolocationAtom,
      event: 'geolocation',
    })

    expect(geolocationAtomObserver.register).toHaveBeenCalled()
    expect(geolocationAtomObserver.start).not.toHaveBeenCalled()
  })

  it('should call start/stop from monitor when started/stopped', () => {
    expect(geolocationMonitor.start).toHaveBeenCalledTimes(0)
    expect(geolocationMonitor.stop).toHaveBeenCalledTimes(0)

    plugin.onStart()

    expect(geolocationMonitor.start).toHaveBeenCalledTimes(1)
    expect(geolocationMonitor.stop).toHaveBeenCalledTimes(0)

    plugin.onStop()

    expect(geolocationMonitor.start).toHaveBeenCalledTimes(1)
    expect(geolocationMonitor.stop).toHaveBeenCalledTimes(1)
  })

  it('should start observing atoms when loaded', () => {
    plugin.onStart()

    plugin.onLoad()

    expect(geolocationAtomObserver.start).toHaveBeenCalled()
  })

  it('should unobserve atoms when stopped', () => {
    plugin.onStart()

    plugin.onStop()

    expect(geolocationAtomObserver.unregister).toHaveBeenCalled()
  })
})
