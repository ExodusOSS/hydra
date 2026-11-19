const initialState = {
  __proto__: null,
  shouldShowRestoredModal: false,
}

const postRestoreModalReduxDefinition = {
  id: 'postRestoreModal',
  type: 'redux-module',
  initialState,
  eventReducers: {
    shouldShowPostRestoredModal: (state, payload) => ({
      ...state,
      shouldShowRestoredModal: payload,
    }),
  },
  selectorDefinitions: [],
}

export default postRestoreModalReduxDefinition
