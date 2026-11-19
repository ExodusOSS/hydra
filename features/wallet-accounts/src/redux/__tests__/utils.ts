import { WalletAccount } from '@exodus/models'
import { type ContainerDependency, setupRedux } from '@exodus/redux-dependency-injection'
import { createStore } from 'redux'

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

export function setup<const Deps extends readonly ContainerDependency[] = readonly []>({
  config = { readOnlyHardwareModels: ['T'] },
  dependencies,
}: {
  config?: { readOnlyHardwareModels?: string[]; maxAmountOfAccounts?: number }
  dependencies?: Deps
} = {}) {
  const allDependencies = [...(dependencies ?? []), walletAccountsReduxModule(config)]

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, combinedReducer } = redux
  const store = createStore(combinedReducer)
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
    store,
    handleEvent,
    emitWalletAccounts,
    enableMultipleWalletAccounts,
    emitActiveWalletAccount,
  }
}
