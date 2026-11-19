import { MY_STATE } from '@exodus/redux-dependency-injection'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'
import { createActiveAssetIncomingTxSelectorDefinition } from './selectors/create-active-asset-incoming-tx.js'
import { createActiveAssetHasIncomingTxSelectorDefinition } from './selectors/create-active-asset-has-incoming-txs.js'
import type { TxLogsReduxState, WalletAccountName } from '../../types.js'

const getHasHistorySelectorDefinition = {
  id: 'getHasHistory',
  resultFunction:
    (myState: TxLogsReduxState, activeWalletAccount: WalletAccountName) =>
    (walletAccount = activeWalletAccount): boolean => {
      return myState[walletAccount]?.hasHistory || false
    },
  dependencies: [
    //
    { selector: MY_STATE },
    { module: 'walletAccounts', selector: 'active' },
  ],
} as const satisfies SelectorDefinition

const customTxLogsSelectors = [
  getHasHistorySelectorDefinition,
  createActiveAssetIncomingTxSelectorDefinition,
  createActiveAssetHasIncomingTxSelectorDefinition,
] as const

export default customTxLogsSelectors
