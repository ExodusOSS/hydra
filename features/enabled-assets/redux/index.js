import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const enabledAssetsReduxDefinition = {
  id: 'enabledAssets',
  type: 'redux-module',
  initialState,
  eventReducers: {
    enabledAssets: (state, enabledAssets) => ({
      ...state,
      loaded: true,
      data: enabledAssets,
    }),
  },
  selectorDefinitions,
}

export default enabledAssetsReduxDefinition
