import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const getMemoizedWalletAccountSelectorFactory = (walletAccountsSelector) =>
  memoize((name) =>
    createSelector(
      (state) => walletAccountsSelector(state)[name],
      (walletAccount) => walletAccount
    )
  )

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'getMemoized',
  selectorFactory: getMemoizedWalletAccountSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
}
