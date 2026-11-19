import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import { WalletAccount } from '@exodus/models'

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME

const resultFunction = (active: string | null, enabled: string[]): string =>
  active && enabled.includes(active) ? active : DEFAULT_WALLET_ACCOUNT

export default defineSelectorResultFunction({
  id: 'active',
  resultFunction,
  dependencies: [
    // auto-generated selector from state
    { selector: 'configuredActiveWalletAccount' },
    { selector: 'enabled' },
  ],
})
