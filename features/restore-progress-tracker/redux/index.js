import id from './id.js'
import initialState from './initial-state.js'

const restoringAssetsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    restoringAssets: (state, payload) => ({
      loaded: true,
      data: payload,
    }),
  },
  selectorDefinitions: [],
}

export default restoringAssetsReduxDefinition
