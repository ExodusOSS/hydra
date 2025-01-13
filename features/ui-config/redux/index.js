import id from './id.js'

const createUiConfigReduxDefinition = (config) => {
  const loadedIds = new Set()
  const configValues = Object.values(config)

  const initialState = {
    ...Object.fromEntries(configValues.map(({ id }) => [id, undefined])),
    loaded: false,
  }

  const eventReducers = Object.fromEntries(
    configValues.map(({ id }) => [
      id,
      (state, payload) => {
        loadedIds.add(id)
        return {
          ...state,
          [id]: payload,
          loaded: loadedIds.size >= configValues.length,
        }
      },
    ])
  )

  return {
    id,
    type: 'redux-module',
    initialState,
    eventReducers,
    selectorDefinitions: [],
  }
}

export default createUiConfigReduxDefinition
