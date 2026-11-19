import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { mapValues, pickBy } from '@exodus/basic-utils'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import { createAsset as createDogecoin } from '@exodus/dogecoin-plugin'
import { createNoopLogger } from '@exodus/logger'
import type { AccountState, Tx, TxSet } from '@exodus/models'
import { WalletAccount } from '@exodus/models'
import {
  type ContainerDependency,
  createReduxStore,
  type ReduxModuleDefinition,
  setupRedux,
} from '@exodus/redux-dependency-injection'
import walletAccountsReduxModule from '@exodus/wallet-accounts/redux/index.js'

const WALLET_ACCOUNTS_STATE = {
  [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  exodus_1: new WalletAccount({
    source: 'exodus',
    index: 1,
    enabled: true,
  }),
}

export const assets = {
  bitcoin: createBitcoin({ assetClientInterface: { createLogger: createNoopLogger } }),
  dogecoin: createDogecoin({ assetClientInterface: { createLogger: createNoopLogger } }),
}

assets.bitcoin.baseAsset = assets.bitcoin
assets.dogecoin.baseAsset = assets.dogecoin

type SetupOptions = {
  dependencies?: ContainerDependency[]
  reduxModule: ReduxModuleDefinition
}

// allow: redux test state is a cross-module bag assembled dynamically by DI
type TestState = Record<string, unknown>

type AccountStatesSelectors = {
  createIsWalletAccountLoadedSelector(walletAccount: string): (state: TestState) => boolean
  isActiveWalletAccountLoaded(state: TestState): boolean
  createAssetSourceSelector(params: {
    assetName: string
    walletAccount: string
  }): (state: TestState) => AccountState
}

type TxLogSelectors = {
  createIsWalletAccountLoadedSelector(walletAccount: string): (state: TestState) => boolean
  isActiveWalletAccountLoaded(state: TestState): boolean
  createAssetSourceSelector(params: {
    assetName: string
    walletAccount: string
  }): (state: TestState) => TxSet
  getHasHistory(state: TestState): (walletAccount?: string) => boolean
  createActiveAssetIncomingTxSelector(assetName: string): (state: TestState) => Tx[]
  createActiveAssetHasIncomingTxSelector(assetName: string): (state: TestState) => boolean
}

type SetupResult = {
  store: { getState(): TestState }
  selectors: {
    accountStates: AccountStatesSelectors
    txLog: TxLogSelectors
  }
  emitActiveWalletAccount(activeWalletAccount: string): void
  emitTxLogs(data: object): void
  emitAccountStates(accountStates: object): void
}

export function setup({ dependencies = [], reduxModule }: SetupOptions): SetupResult {
  const allDependencies: ContainerDependency[] = [
    ...dependencies,
    reduxModule,
    walletAccountsReduxModule(),
    assetsReduxModule,
  ]

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ) as ContainerDependency[], // allow: filtering preserves the dependency union but setupRedux does not carry that through inference
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createReduxStore({ reducers, initialState })
  const handleEvent = createHandleEvent(store)

  const emitActiveWalletAccount = (activeWalletAccount: string) =>
    handleEvent('activeWalletAccount', activeWalletAccount)
  const emitWalletAccounts = (walletAccounts: typeof WALLET_ACCOUNTS_STATE) =>
    handleEvent('walletAccounts', walletAccounts)

  const emitTxLogs = (data: object) => handleEvent('txLogs', data)
  const emitAccountStates = (accountStates: object) => handleEvent('accountStates', accountStates)
  const enableMultipleWalletAccounts = () => handleEvent('multipleWalletAccountsEnabled', true)

  enableMultipleWalletAccounts()
  emitWalletAccounts(WALLET_ACCOUNTS_STATE)
  emitActiveWalletAccount(WalletAccount.DEFAULT_NAME)
  handleEvent('assets', {
    assets,
    defaultAccountStates: mapValues(
      pickBy(assets, (asset) => Boolean(asset.api.features?.accountState)),
      (asset) => asset!.api.createAccountState!().create()
    ),
  })

  return {
    store,
    selectors: redux.selectors as SetupResult['selectors'], // allow: redux DI builds selectors dynamically from the dependency graph
    emitActiveWalletAccount,
    emitTxLogs,
    emitAccountStates,
  }
}
