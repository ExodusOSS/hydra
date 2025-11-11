const isReadOnlySelectorFactory =
  ({ readOnlyHardwareModels = [] }) =>
  (getWalletAccount) =>
  (name) => {
    const walletAccount = getWalletAccount(name)

    return readOnlyHardwareModels.includes(walletAccount?.model)
  }

const createIsReadOnlySelectorDefinition = (config) => ({
  id: 'isReadOnly',
  resultFunction: isReadOnlySelectorFactory(config),
  dependencies: [
    //
    { selector: 'get' },
  ],
})

export default createIsReadOnlySelectorDefinition
