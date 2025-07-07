import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import assetsReduxDefinition from '@exodus/assets-feature/redux/index.js'
import { WalletAccount } from '@exodus/models'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsReduxDefinition from '@exodus/wallet-accounts/redux/index.js'
import { combineReducers, createStore } from 'redux'

const assets = connectAssets(assetsBase)

const WALLET_ACCOUNTS_STATE = {
  [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  exodus_1: new WalletAccount({
    source: 'exodus',
    index: 1,
    enabled: true,
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
}

export const setup = (reduxModuleDefinition) => {
  const allDependencies = [
    reduxModuleDefinition,
    walletAccountsReduxDefinition(),
    assetsReduxDefinition,
  ]

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

  const emitActiveWalletAccount = (activeWalletAccount) =>
    handleEvent('activeWalletAccount', activeWalletAccount)
  const emitWalletAccounts = (data) => handleEvent('walletAccounts', data)

  emitWalletAccounts(WALLET_ACCOUNTS_STATE)
  emitActiveWalletAccount(WalletAccount.DEFAULT_NAME)
  handleEvent('multipleWalletAccountsEnabled', true)
  handleEvent('assets', { assets })

  return { ...redux, store, handleEvent, emitActiveWalletAccount, assets }
}
