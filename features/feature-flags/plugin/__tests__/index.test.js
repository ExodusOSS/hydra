import { mock } from 'node:test'

import * as atoms from '@exodus/atoms'

const createAtomObserver = jest.fn()

mock.module('@exodus/atoms', {
  namedExports: {
    ...atoms,
    createAtomObserver,
  },
})

const { default: featureFlagsPluginDefinition } = await import('../index.js')

describe('featureFlagsLifecyclePlugin', () => {
  let port
  let featureFlagsAtom
  let featureFlags
  let plugin
  let featureFlagsAtomObserver

  beforeEach(() => {
    featureFlagsAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    createAtomObserver.mockReturnValue(featureFlagsAtomObserver)

    port = { emit: jest.fn() }
    featureFlagsAtom = atoms.combine({
      dogeMode: atoms.createInMemoryAtom({
        defaultValue: {
          isOn: false,
        },
      }),
    })
    featureFlags = { load: jest.fn(), clear: jest.fn(), stop: jest.fn() }
    plugin = featureFlagsPluginDefinition.factory({
      port,
      featureFlags,
      featureFlagsAtom,
    })
  })

  it('should create atom observers and register them but not start yet', () => {
    expect(createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: featureFlagsAtom,
      event: 'featureFlags',
    })

    expect(featureFlagsAtomObserver.register).toHaveBeenCalled()
    expect(featureFlagsAtomObserver.start).not.toHaveBeenCalled()
  })

  it('should call load from module when started', () => {
    plugin.onStart()

    expect(featureFlags.load).toHaveBeenCalled()
  })

  it('should start observing atoms when loaded', () => {
    plugin.onLoad()

    expect(featureFlagsAtomObserver.start).toHaveBeenCalled()
  })

  it('should call clear from module when cleared', () => {
    plugin.onClear()

    expect(featureFlags.clear).toHaveBeenCalled()
  })

  it('should unobserve atoms when stopped', () => {
    plugin.onStop()

    expect(featureFlagsAtomObserver.unregister).toHaveBeenCalled()
    expect(featureFlags.stop).toHaveBeenCalled()
  })
})
