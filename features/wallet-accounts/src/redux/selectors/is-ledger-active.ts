import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'

const resultFunction = (
  activeWalletAccount: string,
  isLedger: (name: string) => boolean
): boolean => isLedger(activeWalletAccount)

const isLedgerActiveSelector = defineSelectorResultFunction({
  id: 'isLedgerActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isLedger' },
  ],
})

export default isLedgerActiveSelector
