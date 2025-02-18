import type walletAccountsApiDefinition from './api/index.js'
import type walletAccountsDebugDefinition from './debug/index.js'

declare const walletAccounts: () => {
  id: 'walletAccounts'
  definitions: [
    { definition: typeof walletAccountsApiDefinition },
    { definition: typeof walletAccountsDebugDefinition },
  ]
}

export default walletAccounts
