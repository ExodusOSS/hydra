declare const txLogMonitorsApiDefinition: {
  id: 'txLogMonitorsApi'
  type: 'api'
  factory(): {
    txLogMonitors: {
      update(params: { assetName: string }): Promise<void>
    }
  }
}

export default txLogMonitorsApiDefinition
