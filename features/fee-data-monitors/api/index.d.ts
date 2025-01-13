type FeeData = any

declare const feesApiDefinition: {
  id: 'feesApi'
  type: 'api'
  factory(): {
    fees: {
      getFeeData(params: { assetName: string }): Promise<FeeData>
    }
  }
}

export default feesApiDefinition
