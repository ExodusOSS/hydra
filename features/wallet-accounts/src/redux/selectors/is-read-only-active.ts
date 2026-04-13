const resultFunction = (activeWalletAccount: string, isReadOnly: (name: string) => boolean) =>
  isReadOnly(activeWalletAccount)

const isReadOnlySelector = {
  id: 'isReadOnlyActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isReadOnly' },
  ],
} as const

export default isReadOnlySelector
