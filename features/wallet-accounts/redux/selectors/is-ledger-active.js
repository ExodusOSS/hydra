const resultFunction = (activeWalletAccount, isLedger) => isLedger(activeWalletAccount)

const isLedgerActiveSelector = {
  id: 'isLedgerActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isLedger' },
  ],
}

export default isLedgerActiveSelector
