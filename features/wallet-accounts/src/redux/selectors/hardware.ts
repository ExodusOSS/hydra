import type { WalletAccount } from '@exodus/models'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

/**
 * Returns an array of all wallet account names which belong to hardware wallets.
 */
const selectorFactory = (
  walletAccountNamesSelector: WalletAccountsSelectors['names'],
  getWalletAccountSelector: WalletAccountsSelectors['get']
) =>
  createSelector(
    walletAccountNamesSelector,
    getWalletAccountSelector,
    (walletAccountNames: string[], getWalletAccount: (name: string) => WalletAccount | undefined) =>
      walletAccountNames.filter(
        (walletAccount: string) => getWalletAccount(walletAccount)?.isHardware
      )
  )

const hardwareSelectorDefinition = {
  id: 'hardware',
  selectorFactory,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
  ],
} as const

export default hardwareSelectorDefinition
