// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { MY_STATE } from '@exodus/redux-dependency-injection'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const EMPTY_BALANCES = Object.create(null)

const selectorFactory = (selfSelector) =>
  memoize(
    ({ assetName, walletAccount }) =>
      createSelector(
        selfSelector,
        (balances) => balances[walletAccount]?.data[assetName] ?? EMPTY_BALANCES
      ),
    ({ assetName, walletAccount }) => [assetName, walletAccount].join('-')
  )

const createBalancesSelectorDefinition = {
  id: 'createBalances',
  selectorFactory,
  dependencies: [{ selector: MY_STATE }],
}

export default createBalancesSelectorDefinition
