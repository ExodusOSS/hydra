import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import assetsReduxDefinition from '@exodus/assets-feature/redux/index.js'
import { WalletAccount } from '@exodus/models'
import type { ContainerDependency } from '@exodus/redux-dependency-injection'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsReduxDefinition from '@exodus/wallet-accounts/redux/index.js'
import { createStore } from 'redux'

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

export const setup = (reduxModuleDefinition: ContainerDependency) => {
  const allDependencies: ContainerDependency[] = [
    reduxModuleDefinition,
    walletAccountsReduxDefinition(),
    assetsReduxDefinition,
  ]

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, combinedReducer, initialState } = redux
  const store = createStore(combinedReducer, initialState)
  const handleEvent = createHandleEvent(store)

  const emitActiveWalletAccount = (activeWalletAccount: string) =>
    handleEvent('activeWalletAccount', activeWalletAccount)
  // allow: test scaffolding; emitter is generic over upstream module event payloads.
  const emitWalletAccounts = (data: unknown) => handleEvent('walletAccounts', data)

  emitWalletAccounts(WALLET_ACCOUNTS_STATE)
  emitActiveWalletAccount(WalletAccount.DEFAULT_NAME)
  handleEvent('multipleWalletAccountsEnabled', true)
  handleEvent('assets', { assets })

  return { ...redux, store, handleEvent, emitActiveWalletAccount, assets }
}
