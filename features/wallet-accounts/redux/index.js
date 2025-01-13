import { mapValues } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'

import id from './id.js'
import initialState from './initial-state.js'
import createSelectorDefinitions from './selectors/index.js'

const coerceToWalletAccount = (walletAccount) =>
  walletAccount instanceof WalletAccount ? walletAccount : new WalletAccount(walletAccount)

const checkLoaded = (state) =>
  state.multipleWalletAccountsEnabledLoaded &&
  state.walletAccountsDataLoaded &&
  state.configuredActiveWalletAccountLoaded

const createWalletAccountsReduxDefinition = (config = {}) => ({
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    activeWalletAccount: (state, configuredActiveWalletAccount) => {
      const newState = {
        ...state,
        configuredActiveWalletAccount,
        configuredActiveWalletAccountLoaded: true,
      }
      newState.loaded = checkLoaded(newState)
      return newState
    },
    multipleWalletAccountsEnabled: (state, multipleWalletAccountsEnabled) => {
      const newState = {
        ...state,
        multipleWalletAccountsEnabled,
        multipleWalletAccountsEnabledLoaded: true,
      }
      newState.loaded = checkLoaded(newState)

      return newState
    },
    walletAccounts: (state, walletAccounts) => {
      const newState = {
        ...state,
        error: null,
        data: mapValues(walletAccounts, coerceToWalletAccount),
        walletAccountsDataLoaded: true,
      }
      newState.loaded = checkLoaded(newState)
      return newState
    },
  },
  selectorDefinitions: createSelectorDefinitions(config),
})

export default createWalletAccountsReduxDefinition
