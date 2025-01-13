import createReduxIOC from '../index.js'

describe('createReduxIOC', () => {
  let reduxIOC
  const mockNode = { id: 'test', type: 'redux-module' }

  beforeEach(() => {
    reduxIOC = createReduxIOC({
      createLogger: jest.fn(),
      enhancer: jest.fn(),
      baseReducers: {},
      baseActionCreators: {},
    })
  })

  it('adds a valid node', () => {
    expect(() => reduxIOC.use(mockNode)).not.toThrow()
  })

  it('throws an error if trying to add a node after resolve', () => {
    reduxIOC.resolve()
    expect(() => reduxIOC.use(mockNode)).toThrow('use() cannot be called after resolve()')
  })

  it('throws an error if trying to add an invalid node', () => {
    expect(() => reduxIOC.use({})).toThrow("a 'redux-module' node is required")
  })

  it('throws an error if trying to add a node with an id that is already used', () => {
    reduxIOC.use(mockNode)
    expect(() => reduxIOC.use(mockNode)).toThrow("'test' is already been used")
  })

  it('creates the store', () => {
    const { store } = reduxIOC.resolve()
    expect(store).toEqual('mockStore')
  })

  it('throws an error if trying to resolve more than once', () => {
    reduxIOC.resolve()
    expect(() => reduxIOC.resolve()).toThrow('resolve() can only be called once')
  })
})
