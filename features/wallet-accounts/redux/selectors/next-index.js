import { WalletAccount } from '@exodus/models'
import { createSelector } from 'reselect'

const selectorFactory = (walletAccountsSelector) =>
  createSelector(walletAccountsSelector, (walletAccounts) => {
    // TODO: when we allow >1 trezor portfolio, use the active walletAccount instead
    const { source, id } = WalletAccount.DEFAULT
    const existing = Object.values(walletAccounts).filter(
      (w) => w.source === source && ((!id && !w.id) || w.id === id)
    )

    // can't use count as next index because it'll clobber a deleted account.
    // it wouldn't lose funds, but it might confuse the user if they get a new account with the same addresses as some old one
    const indexes = existing.map(({ index }) => index)
    return Math.max(...indexes) + 1
  })

const nextIndexSelector = {
  id: 'nextIndex',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default nextIndexSelector
