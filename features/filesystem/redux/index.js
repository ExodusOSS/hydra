const initialState = {
  totalSpace: null,
  freeSpace: null,
}

const filesystemReduxDefinition = {
  id: 'filesystem',
  type: 'redux-module',
  initialState,
  eventReducers: {
    filesystem: (state, payload) => ({
      ...state,
      totalSpace: payload.totalSpace,
      freeSpace: payload.freeSpace,
    }),
  },
  selectorDefinitions: [],
}

export default filesystemReduxDefinition
