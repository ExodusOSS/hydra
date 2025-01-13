import { MY_STATE } from '@exodus/redux-dependency-injection'
import { createActiveAssetIncomingTxSelectorDefinition } from './selectors/create-active-asset-incoming-tx.js'
import { createActiveAssetHasIncomingTxSelectorDefinition } from './selectors/create-active-asset-has-incoming-txs.js'

const getHasHistorySelectorDefinition = {
  id: 'getHasHistory',
  resultFunction:
    (myState, activeWalletAccount) =>
    (walletAccount = activeWalletAccount) => {
      return myState[walletAccount]?.hasHistory || false
    },
  dependencies: [
    //
    { selector: MY_STATE },
    { module: 'walletAccounts', selector: 'active' },
  ],
}

const customTxLogsSelectors = [
  getHasHistorySelectorDefinition,
  createActiveAssetIncomingTxSelectorDefinition,
  createActiveAssetHasIncomingTxSelectorDefinition,
]

export default customTxLogsSelectors
