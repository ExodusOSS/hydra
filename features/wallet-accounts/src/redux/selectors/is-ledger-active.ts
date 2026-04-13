const resultFunction = (activeWalletAccount: string, isLedger: (name: string) => boolean) =>
  isLedger(activeWalletAccount)

const isLedgerActiveSelector = {
  id: 'isLedgerActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isLedger' },
  ],
} as const

export default isLedgerActiveSelector
