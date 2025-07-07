declare const personalNotesApiDefinition: {
  id: 'personalNotesApi'
  type: 'api'
  factory(): {
    personalNotes: {
      upsert: (params: {
        txId: string
        address: string
        message?: string
        username?: string
        dapp?: Record<string, any>
        providerData?: { origin: string; network?: string }
        walletConnect?: { dappName: string; dappUrl: string }
        xmrInputs?: Record<string, any>
      }) => Promise<void>
    }
  }
}

export default personalNotesApiDefinition
