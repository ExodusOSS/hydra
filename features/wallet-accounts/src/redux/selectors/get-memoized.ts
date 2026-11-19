// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import type { WalletAccount } from '@exodus/models'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const getMemoizedWalletAccountSelectorFactory = (
  walletAccountsSelector: WalletAccountsSelectors['data']
) =>
  memoize((name: string) =>
    createSelector(
      (state: unknown) => walletAccountsSelector(state)[name],
      (walletAccount: WalletAccount | undefined): WalletAccount | undefined => walletAccount
    )
  )

export default defineSelectorFactory({
  id: 'getMemoized',
  selectorFactory: getMemoizedWalletAccountSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
})
