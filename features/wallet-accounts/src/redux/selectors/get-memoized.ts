// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const getMemoizedWalletAccountSelectorFactory = (
  walletAccountsSelector: WalletAccountsSelectors['data']
) =>
  memoize((name: string) =>
    createSelector(
      (state: unknown) => walletAccountsSelector(state)[name],
      (walletAccount) => walletAccount
    )
  )

export default {
  id: 'getMemoized',
  selectorFactory: getMemoizedWalletAccountSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const
