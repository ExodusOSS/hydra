import createExodusRedux from '../redux'

describe('createExodusRedux', () => {
  let ioc

  beforeEach(() => {
    ioc = createExodusRedux({
      createLogger: () => console,
      reducers: {},
      actionCreators: {},
    })
  })

  test('resolves successfully', () => {
    expect(() => ioc.resolve()).not.toThrow()
  })

  test('resolve() has the correct return value', () => {
    const { store, handleEvent, actionCreators, selectors } = ioc.resolve()
    expect(store).toBeDefined()
    expect(handleEvent).toBeDefined()
    expect(actionCreators).toBeDefined()
    expect(selectors).toBeDefined()
    const expectedSelectors = [
      'application',
      'assets',
      'availableAssets',
      'balances',
      'accountStates',
      'txLog',
      'enabledAssets',
      'featureFlags',
      'feeData',
      'geolocation',
      'locale',
      'rates',
      'remoteConfig',
      'restoringAssets',
      'startupCounter',
      'walletAccounts',
    ]

    expect(Object.keys(selectors)).toEqual(expectedSelectors)
  })
})
