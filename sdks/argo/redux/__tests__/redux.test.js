jest.doMock('redux', () => {
  const combineReducers = jest.fn()
  const createStore = jest.fn(() => 'mockStore')

  return {
    __esModule: true,
    combineReducers,
    createStore,
    legacy_createStore: createStore,
  }
})

await import('./redux.body.js')
