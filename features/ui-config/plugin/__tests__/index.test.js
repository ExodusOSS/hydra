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
})
