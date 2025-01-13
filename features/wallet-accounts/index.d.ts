import type walletAccountsApiDefinition from './api/index.js'

declare const walletAccounts: () => {
  id: 'walletAccounts'
  definitions: [{ definition: typeof walletAccountsApiDefinition }]
}

export default walletAccounts
