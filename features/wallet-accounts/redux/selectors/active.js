import { WalletAccount } from '@exodus/models'

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME

const resultFunction = (active, enabled) =>
  active && enabled.includes(active) ? active : DEFAULT_WALLET_ACCOUNT

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'active',
  resultFunction,
  dependencies: [
    // auto-generated selector from state
    { selector: 'configuredActiveWalletAccount' },
    { selector: 'enabled' },
  ],
}
