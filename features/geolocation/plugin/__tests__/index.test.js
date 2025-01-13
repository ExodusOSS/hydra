import * as atoms from '@exodus/atoms'

import geolocationLifecyclePluginDefinition from '..'

jest.mock('@exodus/atoms', () => ({
  ...jest.requireActual('@exodus/atoms'),
  createAtomObserver: jest.fn(),
}))

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
    geolocationMonitor = { start: jest.fn() }
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

  it('should call start from monitor when started', () => {
    plugin.onStart()

    expect(geolocationMonitor.start).toHaveBeenCalled()
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
