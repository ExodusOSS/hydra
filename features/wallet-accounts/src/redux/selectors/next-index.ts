import { WalletAccount } from '@exodus/models'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const selectorFactory = (walletAccountsSelector: WalletAccountsSelectors['data']) =>
  createSelector(
    walletAccountsSelector,
    (walletAccounts: Record<string, WalletAccount>): number => {
      // TODO: when we allow >1 trezor portfolio, use the active walletAccount instead
      const { source, id } = WalletAccount.DEFAULT
      const existing = Object.values(walletAccounts).filter(
        (w: WalletAccount) => w.source === source && ((!id && !w.id) || w.id === id)
      )

      // can't use count as next index because it'll clobber a deleted account.
      // it wouldn't lose funds, but it might confuse the user if they get a new account with the same addresses as some old one
      const indexes = existing.map((w: WalletAccount) => w.index ?? 0)
      return Math.max(...indexes) + 1
    }
  )

const nextIndexSelector = defineSelectorFactory({
  id: 'nextIndex',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
})

export default nextIndexSelector
