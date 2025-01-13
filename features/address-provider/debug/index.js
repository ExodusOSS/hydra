const createAddressProviderDebug = ({ addressProvider }) => {
  return {
    addressProvider: {
      mockAddress: addressProvider.mockAddress,
      clear: addressProvider.clear,
    },
  }
}

const addressProviderDebugDefinition = {
  id: 'addressProviderDebug',
  type: 'debug',
  factory: createAddressProviderDebug,
  dependencies: ['addressProvider'],
  public: true,
}

export default addressProviderDebugDefinition
