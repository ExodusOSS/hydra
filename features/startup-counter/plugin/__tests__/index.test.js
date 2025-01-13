import * as atoms from '@exodus/atoms'
import startupCounterPluginDefinition from '../index.js'

describe('startupCounterPlugin', () => {
  let plugin
  let walletStartupCountAtom

  beforeEach(() => {
    walletStartupCountAtom = atoms.createInMemoryAtom({ defaultValue: 0 })
    jest.spyOn(walletStartupCountAtom, 'set')
    plugin = startupCounterPluginDefinition.factory({ walletStartupCountAtom })
  })

  it('should increment counter at unlock', async () => {
    await plugin.onUnlock()
    await plugin.onUnlock()
    await plugin.onUnlock()
    await walletStartupCountAtom.set(4)
    expect(walletStartupCountAtom.set).toHaveBeenCalledTimes(4)
  })

  it('should clear counter at clear', async () => {
    await plugin.onUnlock()
    await expect(walletStartupCountAtom.get()).resolves.toBe(1)

    await plugin.onClear()
    await expect(walletStartupCountAtom.get()).resolves.toBe(0)
  })
})
