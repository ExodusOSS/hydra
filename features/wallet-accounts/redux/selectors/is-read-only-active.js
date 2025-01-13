const resultFunction = (activeWalletAccount, isReadOnly) => isReadOnly(activeWalletAccount)

const isReadOnlySelector = {
  id: 'isReadOnlyActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isReadOnly' },
  ],
}

export default isReadOnlySelector
