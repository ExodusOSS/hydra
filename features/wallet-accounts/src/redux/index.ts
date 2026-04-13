import { mapValues } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'
import type { WalletAccountParams } from '@exodus/models/lib/wallet-account/index.js'

import id from './id.js'
import initialState, { type WalletAccountsReduxState } from './initial-state.js'
import createSelectorDefinitions from './selectors/index.js'

const coerceToWalletAccount = (walletAccount: WalletAccount | Record<string, unknown>) =>
  walletAccount instanceof WalletAccount
    ? walletAccount
    : new WalletAccount(walletAccount as WalletAccountParams)

const checkLoaded = (state: WalletAccountsReduxState) =>
  state.multipleWalletAccountsEnabledLoaded &&
  state.walletAccountsDataLoaded &&
  state.configuredActiveWalletAccountLoaded

const createWalletAccountsReduxDefinition = (config?: ReduxConfig) =>
  ({
    id,
    type: 'redux-module',
    initialState,
    eventReducers: {
      activeWalletAccount: (
        state: WalletAccountsReduxState,
        configuredActiveWalletAccount: string
      ) => {
        const newState = {
          ...state,
          configuredActiveWalletAccount,
          configuredActiveWalletAccountLoaded: true,
        }
        newState.loaded = checkLoaded(newState)
        return newState
      },
      multipleWalletAccountsEnabled: (
        state: WalletAccountsReduxState,
        multipleWalletAccountsEnabled: boolean | undefined
      ) => {
        const newState = {
          ...state,
          multipleWalletAccountsEnabled,
          multipleWalletAccountsEnabledLoaded: true,
        }
        newState.loaded = checkLoaded(newState)

        return newState
      },
      walletAccounts: (
        state: WalletAccountsReduxState,
        walletAccounts: Record<string, WalletAccount | Record<string, unknown>>
      ) => {
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
    selectorDefinitions: createSelectorDefinitions(config ?? {}),
  }) as const

interface ReduxConfig {
  readOnlyHardwareModels?: string[]
  maxAmountOfAccounts?: number
}

export type { WalletAccountsSelectors } from './types.js'

export default createWalletAccountsReduxDefinition
