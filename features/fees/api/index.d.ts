import type NumberUnit from '@exodus/currency'

type Fee = {
  fee: NumberUnit
}

declare const feesApiDefinition: {
  id: 'feesModuleApi'
  type: 'api'
  factory(): {
    fees: {
      getFees(params: {
        assetName: string
        walletAccount: string
        fromAddress?: string
        toAddress?: string
        isExchange?: boolean
        isSendAll?: boolean
        gasLimit?: number
      }): Promise<Fee>
    }
  }
}

export default feesApiDefinition
