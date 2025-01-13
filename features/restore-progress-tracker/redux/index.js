import id from './id'
import initialState from './initial-state'

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
