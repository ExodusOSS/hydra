import * as atoms from '@exodus/atoms'
import profileLifecyclePluginDefinition from '..'

jest.mock('@exodus/atoms', () => ({
  ...jest.requireActual('@exodus/atoms'),
  createAtomObserver: jest.fn(),
}))

describe('profileLifecyclePlugin', () => {
  let port
  let profileAtom
  let fusionProfileAtom
  let plugin
  let profileAtomObserver

  beforeEach(() => {
    profileAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    atoms.createAtomObserver.mockReturnValue(profileAtomObserver)

    port = { emit: jest.fn() }
    profileAtom = atoms.createInMemoryAtom()
    fusionProfileAtom = atoms.createInMemoryAtom()

    plugin = profileLifecyclePluginDefinition.factory({
      port,
      profileAtom,
      fusionProfileAtom,
    })
  })

  it('should start observing atoms when loaded', () => {
    plugin.onLoad()

    expect(profileAtomObserver.start).toHaveBeenCalled()
  })

  it('should unobserve atoms when stopped', () => {
    plugin.onStop()

    expect(profileAtomObserver.unregister).toHaveBeenCalled()
  })
})
