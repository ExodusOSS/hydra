import helper from './multi-account-helper.js'

const initialState = {
  hasBalance: false,
  ...helper.createInitialState(),
}

export default initialState
