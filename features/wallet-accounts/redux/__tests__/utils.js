import { WalletAccount } from '@exodus/models'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import walletAccountsReduxModule from '../index.js'

export const WALLET_ACCOUNTS_STATE = {
  [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  exodus_1: new WalletAccount({
    source: 'exodus',
    index: 1,
    enabled: false,
  }),
  trezor_abc: new WalletAccount({
    id: 'abc',
    source: WalletAccount.TREZOR_SRC,
    index: 2,
    enabled: true,
  }),
  ftx_0: new WalletAccount({
    id: 'abc',
    source: WalletAccount.FTX_SRC,
    index: 2,
    enabled: true,
  }),
  ledger_abc: new WalletAccount({
    id: 'abc',
    source: WalletAccount.LEDGER_SRC,
    index: 3,
    enabled: true,
  }),
}

export function setup({ config, dependencies = [] } = {}) {
  const allDependencies = [...dependencies, walletAccountsReduxModule(config)]
  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const emitWalletAccounts = (walletAccounts) => handleEvent('walletAccounts', walletAccounts)
  const enableMultipleWalletAccounts = () => handleEvent('multipleWalletAccountsEnabled', true)

  const emitActiveWalletAccount = (walletAccount) =>
    handleEvent('activeWalletAccount', walletAccount)

  emitActiveWalletAccount('exodus_0')
  enableMultipleWalletAccounts()

  return {
    ...redux,
    store,
    emitWalletAccounts,
    enableMultipleWalletAccounts,
    emitActiveWalletAccount,
  }
}
