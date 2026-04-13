import { WalletAccount } from '@exodus/models'

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME

const resultFunction = (active: string | null, enabled: string[]) =>
  active && enabled.includes(active) ? active : DEFAULT_WALLET_ACCOUNT

export default {
  id: 'active',
  resultFunction,
  dependencies: [
    // auto-generated selector from state
    { selector: 'configuredActiveWalletAccount' },
    { selector: 'enabled' },
  ],
} as const
