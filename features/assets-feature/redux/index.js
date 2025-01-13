import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'
import { keyBy } from '@exodus/basic-utils'

const mergeAssets = (state, payload) => ({
  ...state,
  data: {
    ...state.data,
    ...keyBy(payload, 'name'),
  },
})

const assetsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    'assets-add': mergeAssets,
    'assets-update': mergeAssets,
    assets: (state, { assets }) => {
      return { ...state, error: null, loaded: true, data: assets }
    },
    multiAddressMode: (state, payload) => ({
      ...state,
      multiAddressMode: payload,
    }),
    legacyAddressMode: (state, payload) => ({
      ...state,
      legacyAddressMode: payload,
    }),
    taprootAddressMode: (state, payload) => ({
      ...state,
      taprootAddressMode: payload,
    }),
    disabledPurposes: (state, payload) => ({
      ...state,
      disabledPurposes: payload,
    }),
  },
  selectorDefinitions,
}

export default assetsReduxDefinition
