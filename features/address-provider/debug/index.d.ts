declare const addressProviderDebugDefinition: {
  id: 'addressProviderDebug'
  type: 'debug'
  factory(): {
    addressProvider: {
      mockAddress: (params: {
        walletAccount: string
        assetName: string
        address: string
        purpose?: number
        chainIndex?: number
        addressIndex?: number
      }) => Promise<void>
      clear: () => Promise<void>
    }
  }
}

export default addressProviderDebugDefinition
