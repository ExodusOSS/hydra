import { WalletAccount } from '@exodus/models'

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME
const DEFAULT_ENABLED = Object.freeze([DEFAULT_WALLET_ACCOUNT])

const resultFunction = (walletAccounts, get, multipleWalletAccountsEnabled) =>
  multipleWalletAccountsEnabled
    ? walletAccounts.filter((walletAccount) => get(walletAccount).enabled)
    : DEFAULT_ENABLED

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'enabled',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
    { selector: 'multipleWalletAccountsEnabled' },
  ],
}
