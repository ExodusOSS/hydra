import id from './id'

const DEFAULT_PROFILE = { name: 'Exodus', nft: null }

const createProfileReduxDefinition = ({ defaultProfile = DEFAULT_PROFILE } = {}) => ({
  id,
  type: 'redux-module',
  initialState: {
    loaded: false,
    data: defaultProfile,
  },
  eventReducers: {
    profile: (state, data) => ({ ...state, loaded: true, data }),
  },
  selectorDefinitions: [],
})

export default createProfileReduxDefinition
