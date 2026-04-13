import { createInMemoryAtom } from '@exodus/atoms'

import createUiConfigPluginDefinition from '../index.js'

const configValues = [
  {
    id: 'acceptedTerms',
    atomId: 'acceptedTermsConfigAtom',
    encrypted: false,
  },
  {
    id: 'exchangeFromAsset',
    atomId: 'exchangeFromAssetConfigAtom',
  },
  {
    id: 'persistValue',
    atomId: 'persistValueConfigAtom',
    persist: true,
  },
]

describe('uiConfig plugin', () => {
  it('should include syncable atoms in dependencies', () => {
    const { definition } = createUiConfigPluginDefinition({
      configValues: [
        { id: 'localConfig', atomId: 'localConfigAtom' },
        { id: 'syncedConfig', atomId: 'syncedConfigAtom', syncable: true },
      ],
    })

    expect(definition.dependencies).toContain('localConfigAtom')
    expect(definition.dependencies).toContain('syncedConfigAtom')
    expect(definition.dependencies).toContain('syncablesyncedConfigAtom')
    expect(definition.dependencies).not.toContain('syncablelocalConfigAtom')
  })

  it('should setup sync observers on onStart for syncable atoms', () => {
    const port = { emit: jest.fn() }
    const localAtom = {
      observe: jest.fn().mockReturnValue(jest.fn()),
      set: jest.fn((fn) => fn('localValue')),
      get: jest.fn(),
    }
    const remoteAtom = {
      observe: jest.fn((callback) => {
        callback('remoteValue')
        return jest.fn()
      }),
      set: jest.fn(),
      get: jest.fn(),
    }

    const { definition } = createUiConfigPluginDefinition({
      configValues: [{ id: 'syncedConfig', atomId: 'syncedConfigAtom', syncable: true }],
    })

    const plugin = definition.factory({
      port,
      syncedConfigAtom: localAtom,
      syncablesyncedConfigAtom: remoteAtom,
    })

    expect(localAtom.observe).toHaveBeenCalledTimes(1)
    expect(remoteAtom.observe).not.toHaveBeenCalled()

    plugin.onStart()

    expect(remoteAtom.observe).toHaveBeenCalledTimes(1)
    expect(localAtom.observe).toHaveBeenCalledTimes(2)

    plugin.onStop()
  })

  it('should cleanup sync observers on onStop', () => {
    const port = { emit: jest.fn() }
    const unsubscribeLocal = jest.fn()
    const unsubscribeRemote = jest.fn()
    const localAtom = {
      observe: jest.fn().mockReturnValueOnce(jest.fn()).mockReturnValue(unsubscribeLocal),
      set: jest.fn((fn) => fn('localValue')),
      get: jest.fn(),
    }
    const remoteAtom = {
      observe: jest.fn((callback) => {
        callback('remoteValue')
        return unsubscribeRemote
      }),
      set: jest.fn(),
      get: jest.fn(),
    }

    const { definition } = createUiConfigPluginDefinition({
      configValues: [{ id: 'syncedConfig', atomId: 'syncedConfigAtom', syncable: true }],
    })

    const plugin = definition.factory({
      port,
      syncedConfigAtom: localAtom,
      syncablesyncedConfigAtom: remoteAtom,
    })

    plugin.onStart()

    expect(unsubscribeLocal).not.toHaveBeenCalled()
    expect(unsubscribeRemote).not.toHaveBeenCalled()

    plugin.onStop()

    expect(unsubscribeLocal).toHaveBeenCalledTimes(1)
    expect(unsubscribeRemote).toHaveBeenCalledTimes(1)
  })

  it('should emit values on load', async () => {
    const port = { emit: jest.fn() }

    const { definition } = createUiConfigPluginDefinition({ configValues })

    const acceptedTermsConfigAtom = createInMemoryAtom()
    const exchangeFromAssetConfigAtom = createInMemoryAtom()
    const persistValueConfigAtom = createInMemoryAtom()

    await acceptedTermsConfigAtom.set(false)
    await exchangeFromAssetConfigAtom.set('something')
    await persistValueConfigAtom.set('something')

    const plugin = definition.factory({
      port,
      acceptedTermsConfigAtom,
      exchangeFromAssetConfigAtom,
      persistValueConfigAtom,
    })

    expect(port.emit).toHaveBeenCalledTimes(0)

    // Test observables start
    await plugin.onLoad()

    // Simulate atom get delay
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(port.emit).toHaveBeenCalledWith('acceptedTerms', false)
    expect(port.emit).toHaveBeenCalledWith('exchangeFromAsset', 'something')
    expect(port.emit).toHaveBeenCalledWith('persistValue', 'something')

    await acceptedTermsConfigAtom.set(true)
    expect(port.emit).toHaveBeenCalledWith('acceptedTerms', true)

    // Test observables stop
    await plugin.onStop()

    await exchangeFromAssetConfigAtom.set('other')
    expect(port.emit).not.toHaveBeenCalledWith('exchangeFromAsset', 'other')

    // Test atom clear
    await plugin.onClear()

    await expect(acceptedTermsConfigAtom.get()).resolves.toBe(undefined)
    await expect(exchangeFromAssetConfigAtom.get()).resolves.toBe(undefined)
    await expect(persistValueConfigAtom.get()).resolves.toBe('something')
  })

  it('should not flip-flop when local and remote atoms have different initial values', async () => {
    const port = { emit: jest.fn() }

    const MAX_SET_CALLS = 10

    let setCount = 0
    const wrapAtomWithSetLimit = (atom, name) => {
      return {
        ...atom,
        observe: atom.observe.bind(atom),
        get: atom.get.bind(atom),
        set: (...args) => {
          if (++setCount > MAX_SET_CALLS) {
            throw new Error(
              `Flip-flop detected: ${name}.set() called more than ${MAX_SET_CALLS} times`
            )
          }

          return atom.set(...args)
        },
      }
    }

    const localAtom = wrapAtomWithSetLimit(createInMemoryAtom({ defaultValue: true }), 'localAtom')
    const remoteAtom = wrapAtomWithSetLimit(
      createInMemoryAtom({ defaultValue: false }),
      'remoteAtom'
    )

    const { definition } = createUiConfigPluginDefinition({
      configValues: [{ id: 'syncedConfig', atomId: 'syncedConfigAtom', syncable: true }],
    })

    const plugin = definition.factory({
      port,
      syncedConfigAtom: localAtom,
      syncablesyncedConfigAtom: remoteAtom,
    })

    plugin.onStart()

    await new Promise(setImmediate)

    const localValue = await localAtom.get()
    const remoteValue = await remoteAtom.get()
    expect(localValue).toBe(remoteValue)

    plugin.onStop()
  })
})
