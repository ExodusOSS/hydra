jest.doMock('@exodus/atoms/factories/observer', () => ({ __esModule: true, default: jest.fn() }))

const atoms = await import('@exodus/atoms')
const { default: assetBase } = await import('@exodus/assets-base')
const { default: createBalancesLifecyclePlugin } = await import('../lifecycle.js')

describe('balancesPlugin', () => {
  const { bitcoin } = assetBase

  const data = {
    balances: {
      exodus_0: {
        [bitcoin.name]: {
          balance: bitcoin.currency.defaultUnit(0),
          confirmedBalance: bitcoin.currency.defaultUnit(0),
        },
      },
    },
  }

  let port
  let balancesAtom
  let balances
  let plugin
  let unregister
  let start
  let hasBalanceAtom
  let assetsTotalWalletAmountsAtom

  beforeEach(() => {
    unregister = jest.fn()
    start = jest.fn()
    atoms.createAtomObserver.mockReturnValue({ unregister, start })

    port = { emit: jest.fn() }
    balancesAtom = atoms.createInMemoryAtom({ defaultValue: data })
    hasBalanceAtom = atoms.createInMemoryAtom({ defaultValue: false })
    hasBalanceAtom.set = jest.fn()
    assetsTotalWalletAmountsAtom = atoms.createInMemoryAtom({ defaultValue: false })
    assetsTotalWalletAmountsAtom.set = jest.fn()

    balances = { load: jest.fn(), stop: jest.fn() }
    plugin = createBalancesLifecyclePlugin({
      port,
      balancesAtom,
      balances,
      hasBalanceAtom,
    })
  })

  it('should start oberserving atom when loaded', () => {
    plugin.onLoad()

    expect(start).toHaveBeenCalled()
  })

  it('should call load from module when loaded', () => {
    plugin.onLoad()

    expect(balances.load).toHaveBeenCalled()
  })

  it('should unobserve atom when stopped', () => {
    plugin.onStop()

    expect(unregister).toHaveBeenCalled()
  })
  it('hasBalanceAtom should be cleared', () => {
    plugin.onClear()
    expect(hasBalanceAtom.set).toHaveBeenCalledWith(undefined)
  })
})
