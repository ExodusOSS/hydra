export type TxLogMonitorUpdateParams = {
  assetName: string
  walletAccount?: string
  refresh?: boolean
  highPriority?: boolean
}

export type TxLogMonitors = {
  update(params: TxLogMonitorUpdateParams): Promise<void>
  updateAll(): Promise<void[]>
  start(): Promise<void>
  stop(): Promise<void>
}
