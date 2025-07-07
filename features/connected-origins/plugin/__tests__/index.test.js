import * as atomsActual from '@exodus/atoms'

jest.doMock('@exodus/atoms', () => ({
  __esModule: true,
  ...atomsActual,
  createAtomObserver: jest.fn(),
}))

const atoms = await import('@exodus/atoms')
const { default: connectedOriginsPluginDefinition } = await import('../index.js')

describe('connectedOriginsPlugin', () => {
  const data = [{ origin: 'exodus.com' }]

  let port
  let connectedOriginsAtom
  let connectedOrigins
  let plugin
  let unregister
  let start

  beforeEach(() => {
    unregister = jest.fn()
    start = jest.fn()
    atoms.createAtomObserver.mockReturnValue({
      unregister,
      start,
    })

    port = { emit: jest.fn() }
    connectedOriginsAtom = atoms.createInMemoryAtom({ defaultValue: data })

    connectedOrigins = new (class ModuleMock {
      clear = jest.fn()
      updateConnectedAccounts = jest.fn()
    })()

    plugin = connectedOriginsPluginDefinition.factory({
      port,
      connectedOriginsAtom,
      connectedOrigins,
      enabledWalletAccountsAtom: atoms.createInMemoryAtom({ defaultValue: {} }),
    })
  })

  it('should create atom observer', () => {
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: connectedOriginsAtom,
      event: 'connectedOrigins',
    })
  })

  it('should start oberserving atom when loaded and unlocked', () => {
    plugin.onLoad({ isLocked: false })

    expect(start).toHaveBeenCalled()
  })

  it('should do nothing when loaded and locked', () => {
    plugin.onLoad({ isLocked: true })

    expect(start).not.toHaveBeenCalled()
  })

  it('should start oberserving atom when unlocked', () => {
    plugin.onUnlock()

    expect(start).toHaveBeenCalled()
  })

  it('should call clear from module when cleared', () => {
    plugin.onClear()

    expect(connectedOrigins.clear).toHaveBeenCalled()
  })

  it('should unobserve atom when stopped', () => {
    plugin.onStop()

    expect(unregister).toHaveBeenCalled()
  })
})
