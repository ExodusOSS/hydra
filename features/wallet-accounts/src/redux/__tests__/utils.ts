import { WalletAccount } from '@exodus/models'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore, type Reducer, type StoreEnhancer } from 'redux'

import walletAccountsReduxModule, { type WalletAccountsSelectors } from '../index.js'

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
    model: 'T',
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

export function setup({
  config = { readOnlyHardwareModels: ['T'] },
  dependencies = [],
}: {
  config?: { readOnlyHardwareModels?: string[]; maxAmountOfAccounts?: number }
  dependencies?: { id: string; [key: string]: unknown }[]
} = {}) {
  const allDependencies = [...dependencies, walletAccountsReduxModule(config)]

  // StoreEnhancer expects (createStore) => createStore, but setupRedux passes a { [slice]: Reducer }
  // object for reducers instead of a single Reducer. Redux's types don't support this shape, so the
  // enhancer params must be `any` to accept the untyped reducers object and forward it to combineReducers.

  const enhancers = ((cs: any) => (reducers: any, initialState: any, enhancer: any) => {
    const reducer = combineReducers(reducers as Record<string, Reducer>)
    return cs(reducer, initialState, enhancer)
  }) as StoreEnhancer

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep: { id: string }, i: number) =>
        allDependencies.findIndex((other: { id: string }) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers as unknown as Reducer, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const emitWalletAccounts = (
    walletAccounts: Record<string, WalletAccount | Record<string, unknown>>
  ) => handleEvent('walletAccounts', walletAccounts)
  const enableMultipleWalletAccounts = () => handleEvent('multipleWalletAccountsEnabled', true)

  const emitActiveWalletAccount = (walletAccount: string | undefined) =>
    handleEvent('activeWalletAccount', walletAccount)

  emitActiveWalletAccount('exodus_0')
  enableMultipleWalletAccounts()

  return {
    ...redux,

    // setupRedux infers selectors via conditional mapped types that TS cannot narrow to concrete shapes.
    // Casting to a known selector map avoids `as any` on every test call site.
    selectors: redux.selectors as unknown as { walletAccounts: WalletAccountsSelectors },
    store,
    emitWalletAccounts,
    enableMultipleWalletAccounts,
    emitActiveWalletAccount,
  }
}
