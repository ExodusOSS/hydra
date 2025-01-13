import { combineReducers, legacy_createStore as createStore } from 'redux'
import { setupRedux, setupActions } from '@exodus/redux-dependency-injection'

function createReduxIOC({
  createLogger,
  enhancer,
  reducers: baseReducers,
  actionCreators: baseActionCreators,
}) {
  let isResolved = false
  const reduxNodes = new Map()

  const use = (node) => {
    if (isResolved) {
      throw new Error('use() cannot be called after resolve()')
    }

    if (!node || !node.id || node.type !== 'redux-module') {
      throw new Error("a 'redux-module' node is required")
    }

    const nodeExists = reduxNodes.has(node.id)
    if (nodeExists) {
      throw new Error(`'${node.id}' is already been used`)
    }

    reduxNodes.set(node.id, node)
  }

  const resolve = () => {
    if (isResolved) {
      throw new Error('resolve() can only be called once')
    }

    const { selectors, createHandleEvent, reducers, ioc, initialState } = setupRedux({
      reducers: baseReducers,
      initialState: {},
      dependencies: [...reduxNodes.values()],
      createLogger,
    })

    const store = createStore(combineReducers(reducers), initialState, enhancer)
    const actionCreators = setupActions({ actions: baseActionCreators, ioc })
    const handleEvent = createHandleEvent(store)

    isResolved = true
    return { selectors, actionCreators, handleEvent, store }
  }

  return {
    use,
    resolve,
  }
}

export default createReduxIOC
