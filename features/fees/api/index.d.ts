import type NumberUnit from '@exodus/currency'

type Fee = {
  fee: NumberUnit
  [key: string]: unknown
}

type GetFeesParams = {
  assetName: string
  walletAccount: string
  fromAddress?: string
  toAddress?: string
  isExchange?: boolean
  isSendAll?: boolean
  gasLimit?: number
  [key: string]: unknown
}

declare const feesApiDefinition: {
  id: 'feesModuleApi'
  type: 'api'
  factory(): {
    fees: {
      getFees(params: GetFeesParams): Promise<Fee>
    }
  }
}

export default feesApiDefinition
