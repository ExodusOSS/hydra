// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { MY_STATE } from '@exodus/redux-dependency-injection'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const selectorFactory = (selfSelector) =>
  createSelector(selfSelector, (balances) =>
    memoize(
      ({ assetName, walletAccount }) => {
        return balances[walletAccount]?.data[assetName]
      },
      ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
    )
  )

const getBalancesSelectorDefinition = {
  id: 'getBalances',
  selectorFactory,
  dependencies: [{ selector: MY_STATE }],
}

export default getBalancesSelectorDefinition
