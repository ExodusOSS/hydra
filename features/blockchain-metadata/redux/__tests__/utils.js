import { combineReducers, createStore } from 'redux'
import { mapValues, pickBy } from '@exodus/basic-utils'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsReduxModule from '@exodus/wallet-accounts/redux/index.js'
import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import { createAsset as createDogecoin } from '@exodus/dogecoin-plugin'
import { WalletAccount } from '@exodus/models'

const WALLET_ACCOUNTS_STATE = {
  [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  exodus_1: new WalletAccount({
    source: 'exodus',
    index: 1,
    enabled: true,
  }),
}

export const assets = {
  bitcoin: createBitcoin({ assetClientInterface: {} }),
  dogecoin: createDogecoin(),
}

assets.bitcoin.baseAsset = assets.bitcoin
assets.dogecoin.baseAsset = assets.dogecoin

export function setup({ dependencies = [], reduxModule } = {}) {
  const allDependencies = [
    ...dependencies,
    reduxModule,
    walletAccountsReduxModule(),
    assetsReduxModule,
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
  const emitWalletAccounts = (walletAccounts) => handleEvent('walletAccounts', walletAccounts)

  const emitTxLogs = (data) => handleEvent('txLogs', data)
  const emitAccountStates = (accountStates) => handleEvent('accountStates', accountStates)
  const enableMultipleWalletAccounts = () => handleEvent('multipleWalletAccountsEnabled', true)

  enableMultipleWalletAccounts()
  emitWalletAccounts(WALLET_ACCOUNTS_STATE)
  emitActiveWalletAccount(WalletAccount.DEFAULT_NAME)
  handleEvent('assets', {
    assets,
    defaultAccountStates: mapValues(
      pickBy(assets, (asset) => asset.api?.hasFeature?.('accountState')),
      (asset) => asset.api.createAccountState().create()
    ),
  })

  return { ...redux, store, emitActiveWalletAccount, emitTxLogs, emitAccountStates }
}
