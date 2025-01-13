import { mapValues } from '@exodus/basic-utils'

const resultFunction = (balancesByWalletAccount) =>
  mapValues(balancesByWalletAccount, (balances) => balances.balance)

const byWalletAccountSelector = {
  id: 'byWalletAccount',
  resultFunction,
  dependencies: [
    //
    { selector: 'byWalletAccountField' },
  ],
}

export default byWalletAccountSelector
