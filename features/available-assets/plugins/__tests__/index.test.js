import * as atomsActual from '@exodus/atoms'

jest.doMock('@exodus/atoms', () => ({
  __esModule: true,
  ...atomsActual,
  createAtomObserver: jest.fn(),
}))

const atoms = await import('@exodus/atoms')
const { default: availableAssetsPluginDefinition } = await import('../index.js')

describe('availableAssetsPlugin', () => {
  const data = new Set(['bitcoin', 'ethereum'])

  let port
  let availableAssetNamesAtom
  let plugin
  let register
  let unregister
  let start
  let availableAssets

  beforeEach(() => {
    register = jest.fn()
    unregister = jest.fn()
    start = jest.fn()
    atoms.createAtomObserver.mockReturnValue({
      register,
      unregister,
      start,
    })
    availableAssets = {
      stop: jest.fn(),
    }

    port = { emit: jest.fn() }
    availableAssetNamesAtom = atoms.createInMemoryAtom({ defaultValue: data })
    plugin = availableAssetsPluginDefinition.factory({
      port,
      availableAssetNamesAtom,
      availableAssets,
    })
  })

  it('should create atom observer and register', () => {
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: availableAssetNamesAtom,
      event: 'availableAssetNames',
    })
  })

  it('should start oberserving atom when loaded', async () => {
    plugin.onLoad()

    expect(start).toHaveBeenCalled()
  })

  it('should unobserve atom when stopped', async () => {
    plugin.onStop()

    expect(unregister).toHaveBeenCalled()
    expect(availableAssets.stop).toHaveBeenCalled()
  })
})
